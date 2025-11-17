import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useMemo } from "react";

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

  const ingredients = shoppinglist.data?.ingredients || [];
  const safeIndex = Math.min(index, ingredients.length - 1);
  const currentIngredient = ingredients[safeIndex];
  const navigate = useNavigate({ from: Route.path });

  const handleNext = () => {
    console.log("Calling next");
    navigate({
      search: (prev) => {
        return { ...prev, index: safeIndex + 1 };
      },
    });
  };

  const {
    listening,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    transcribing: true,
    commands: [
      {
        callback: handleNext,
        command: ["next", "skip"],
      },
    ],
  });

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  if (!browserSupportsContinuousListening) {
    return <span>Can't do continuous listening...</span>;
  }

  if (!isMicrophoneAvailable) {
    return <span>Can't access the mic</span>;
  }

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

  if (ingredients.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-4xl">No ingredients in this shopping list</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8">
      <div className="flex-1 flex items-center justify-center w-full py-8lh">
        <h1 className="text-9xl font-bold text-center capitalize break-words max-w-full">
          {currentIngredient.ingredient.name}
        </h1>
      </div>

      <div className="pb-6 flex flex-col gap-4 items-center">
        <div className="flex gap-4">
          <Button
            label={listening ? "⏹ Stop" : "⏺ Start"}
            onClick={() => {
              if (listening) {
                SpeechRecognition.stopListening();
              } else {
                SpeechRecognition.startListening({ continuous: true });
              }
            }}
            className="text-2xl px-8 py-4"
          />
          <Button label={"✓ Check"} className="text-lg px-6 py-3" />
          <Button
            label={"⏭ Skip"}
            onClick={handleNext}
            className="text-lg px-6 py-3"
          />
        </div>
        {listening && (
          <div className="mb-4 text-xl font-semibold">🎤 Listening...</div>
        )}
      </div>
    </div>
  );
}
