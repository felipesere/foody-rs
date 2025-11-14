import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";

const fullscreenSearchSchema = z.object({
  index: z.number().int().nonnegative().catch(0),
  autoplay: z.boolean().catch(false),
});

export const Route = createFileRoute(
  "/_auth/shoppinglist/$shoppinglistId/fullscreen",
)({
  component: FullscreenPage,
  validateSearch: fullscreenSearchSchema,
});

export function FullscreenPage() {
  const params = Route.useParams();
  const shoppinglistId = Number(params.shoppinglistId);
  const { index, autoplay } = Route.useSearch();
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);
  const navigate = useNavigate();

  if (shoppinglist.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-4xl">Loading...</p>
      </div>
    );
  }

  if (shoppinglist.isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-4xl text-red-600">Failed to load shoppinglist</p>
      </div>
    );
  }

  const ingredients = shoppinglist.data?.ingredients || [];

  if (ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-4xl">No ingredients in this shopping list</p>
      </div>
    );
  }

  // Ensure index is within bounds
  const safeIndex = Math.min(index, ingredients.length - 1);
  const currentIngredient = ingredients[safeIndex];

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(
      currentIngredient.ingredient.name,
    );
    window.speechSynthesis.speak(utterance);
  };

  const toggleAutoplay = () => {
    navigate({
      search: (prev) => ({ ...prev, autoplay: !autoplay }),
    });
  };

  // Auto-play effect
  useEffect(() => {
    if (!autoplay) return;

    // Speak the current ingredient
    const utterance = new SpeechSynthesisUtterance(
      currentIngredient.ingredient.name,
    );
    window.speechSynthesis.speak(utterance);

    // Navigate to next ingredient after 3 seconds
    const timer = setTimeout(() => {
      const nextIndex = safeIndex + 1;
      if (nextIndex < ingredients.length) {
        navigate({
          search: { index: nextIndex, autoplay: true },
        });
      } else {
        // Stop autoplay when reaching the end
        navigate({
          search: { index: safeIndex, autoplay: false },
        });
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [autoplay, safeIndex, currentIngredient, ingredients.length, navigate]);

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8">
      <div className="flex-1 flex items-center justify-center w-full py-8lh">
        <h1 className="text-9xl font-bold text-center capitalize break-words max-w-full">
          {currentIngredient.ingredient.name}
        </h1>
      </div>
      <div className="pb-6 flex gap-4">
        <Button
          onClick={handleSpeak}
          label={"▶ Play"}
          className="text-2xl px-8 py-4"
        />
        <Button
          onClick={toggleAutoplay}
          label={autoplay ? "⏸ Stop Auto-play" : "▶▶ Auto-play"}
          className="text-2xl px-8 py-4"
        />
      </div>
    </div>
  );
}
