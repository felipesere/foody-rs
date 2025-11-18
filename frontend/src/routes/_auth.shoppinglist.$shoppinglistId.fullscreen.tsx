import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { z } from "zod";
import {
  useRemoveIngredientFromShoppinglist,
  useShoppinglist,
  useToggleIngredientInShoppinglist,
} from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";
import { Progressbar } from "../components/progressbar.tsx";

const fullscreenSearchSchema = z.object({
  index: z.number().int().nonnegative().catch(0),
});

export const Route = createFileRoute(
  "/_auth/shoppinglist/$shoppinglistId/fullscreen",
)({
  component: FullscreenPage,
  validateSearch: fullscreenSearchSchema,
});

const speak = (text: string) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  synth.speak(utterance);
};

export function FullscreenPage() {
  const params = Route.useParams();
  const shoppinglistId = Number(params.shoppinglistId);
  const { index } = Route.useSearch();
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);
  const checkItem = useToggleIngredientInShoppinglist(token, shoppinglistId);
  const deleteItem = useRemoveIngredientFromShoppinglist(token, shoppinglistId);

  const ingredients = shoppinglist.data?.ingredients || [];
  const safeIndex = Math.min(index, ingredients.length - 1);
  const currentIngredient = ingredients[safeIndex];
  const navigate = useNavigate({ from: Route.path });
  const next = safeIndex + 1;
  const isLast = next >= ingredients.length;

  const goToNext = () => {
    if (isLast) {
      navigate({ to: ".." });
    } else {
      navigate({
        search: (prev) => {
          return { ...prev, index: next };
        },
      });
    }
  };

  const handleCheck = () => {
    checkItem.mutate({
      ingredientId: currentIngredient.ingredient.id,
      inBasket: true,
    });
    goToNext();
  };

  const handleDelete = () => {
    deleteItem.mutate({
      ingredient: currentIngredient.ingredient.id.toString(),
    });
    goToNext();
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
        callback: goToNext,
        command: ["next", "skip"],
      },
      {
        callback: handleCheck,
        command: ["check"],
      },

      {
        callback: handleDelete,
        command: ["delete", "remove"],
      },
    ],
  });

  useEffect(() => {
    if (listening && currentIngredient) {
      let t = setTimeout(() => {
        speak(currentIngredient.ingredient.name);
      }, 500);
      return () => {
        clearTimeout(t);
      };
    }
  }, [listening, currentIngredient]);

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
        <div className="w-full">
          <Progressbar fraction={(100 * (index + 1)) / ingredients.length} />
        </div>
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
          <Button
            label={"✓ Check"}
            onClick={handleCheck}
            className="text-lg px-6 py-3"
          />
          <Button
            label={"✓ Delete"}
            onClick={handleDelete}
            className="text-lg px-6 py-3"
          />
          <Button
            label={isLast ? "⬕ Back" : "⏭ Skip"}
            onClick={goToNext}
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
