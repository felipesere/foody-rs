import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const handleStop = () => {
    navigate({
      search: { index: safeIndex, autoplay: false },
    });
  };

  const handleContinue = () => {
    const nextIndex = safeIndex + 1;
    if (nextIndex < ingredients.length) {
      navigate({
        search: { index: nextIndex, autoplay: true },
      });
    }
  };

  const handleCheck = () => {
    console.log(`Checked ingredient: ${currentIngredient.ingredient.name}`);
    // Move to next ingredient after checking
    const nextIndex = safeIndex + 1;
    if (nextIndex < ingredients.length) {
      navigate({
        search: { index: nextIndex, autoplay },
      });
    }
  };

  const handleAgain = () => {
    const utterance = new SpeechSynthesisUtterance(
      currentIngredient.ingredient.name,
    );
    window.speechSynthesis.speak(utterance);
  };

  const handleSkip = () => {
    const nextIndex = safeIndex + 1;
    if (nextIndex < ingredients.length) {
      navigate({
        search: { index: nextIndex, autoplay },
      });
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("Heard:", transcript);

      if (transcript.includes("stop") || transcript.includes("pause")) {
        handleStop();
      } else if (transcript.includes("continue")) {
        handleContinue();
      } else if (transcript.includes("check")) {
        handleCheck();
      } else if (transcript.includes("again")) {
        handleAgain();
      } else if (transcript.includes("skip") || transcript.includes("next")) {
        handleSkip();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [safeIndex, autoplay, currentIngredient, ingredients.length]);

  // Auto-play effect with speech recognition
  useEffect(() => {
    if (!autoplay) {
      // Stop listening when autoplay is off
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Speak the current ingredient
    const utterance = new SpeechSynthesisUtterance(
      currentIngredient.ingredient.name,
    );

    utterance.onend = () => {
      // Start listening after speaking
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error("Error starting recognition:", error);
        }
      }
    };

    window.speechSynthesis.speak(utterance);

    // Navigate to next ingredient after 3 seconds
    const timer = setTimeout(() => {
      // Stop listening before navigating
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }

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
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [autoplay, safeIndex, currentIngredient, ingredients.length, navigate, isListening]);

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8">
      <div className="flex-1 flex items-center justify-center w-full py-8lh">
        <h1 className="text-9xl font-bold text-center capitalize break-words max-w-full">
          {currentIngredient.ingredient.name}
        </h1>
      </div>

      {isListening && (
        <div className="mb-4 text-red-600 text-xl font-semibold">
          🎤 Listening...
        </div>
      )}

      <div className="pb-6 flex flex-col gap-4 items-center">
        <div className="flex gap-4">
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

        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={handleStop}
            label={"⏹ Stop"}
            className="text-lg px-6 py-3"
          />
          <Button
            onClick={handleContinue}
            label={"▶ Continue"}
            className="text-lg px-6 py-3"
          />
          <Button
            onClick={handleCheck}
            label={"✓ Check"}
            className="text-lg px-6 py-3"
          />
          <Button
            onClick={handleAgain}
            label={"🔁 Again"}
            className="text-lg px-6 py-3"
          />
          <Button
            onClick={handleSkip}
            label={"⏭ Skip"}
            className="text-lg px-6 py-3"
          />
        </div>
      </div>
    </div>
  );
}
