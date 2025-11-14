import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";

export const Route = createFileRoute(
  "/_auth/shoppinglist/$shoppinglistId/fullscreen",
)({
  component: FullscreenPage,
});

export function FullscreenPage() {
  const params = Route.useParams();
  const shoppinglistId = Number(params.shoppinglistId);
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);

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

  const currentIngredient = ingredients[0];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white p-8">
      <div className="flex-1 flex items-center justify-center w-full">
        <h1 className="text-9xl font-bold text-center capitalize break-words max-w-full">
          {currentIngredient.ingredient.name}
        </h1>
      </div>
    </div>
  );
}
