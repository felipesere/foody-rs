import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useState } from "react";
import { UnstoredRecipe, useCreateRecipe } from "../../api/v1/recipes.ts";
import {
  RecipeContext,
  RecipeView,
} from "../../components/smart/recipeView.tsx";
import { parse } from "../../quantities.ts";

export const Route = createFileRoute("/_auth/recipes/new")({
  component: NewRecipePage,
});

function NewRecipePage() {
  const [recipe, setRecipe] = useState<UnstoredRecipe>({
    kind: "recipe",
    ingredients: [],
    name: "",
    source: "book",
    title: "",
    page: 0,
    url: null,
    rating: 0,
    tags: [],
    notes: "",
    duration: null,
  });
  const navigate = useNavigate({ from: "/recipes/new" });

  const newRecipe = useCreateRecipe((id) =>
    navigate({ to: "/recipes/$recipeId", params: { recipeId: `${id}` } }),
  );

  return (
    <RecipeContext.Provider value={{ editing: true }}>
      <RecipeView
        onSave={() => {
          newRecipe.mutate(recipe);
        }}
        onCancel={() => navigate({ to: "/recipes" })}
        recipe={recipe}
        onSetName={(name) => setRecipe((prev) => ({ ...prev, name }))}
        onSetSource={(source) => {
          if (source.source === "book") {
            setRecipe((prev) => ({
              ...prev,
              source: "book",
              page: source.page,
              title: source.title,
              url: null,
            }));
          }
          if (source.source === "website") {
            setRecipe((prev) => ({
              ...prev,
              source: "website",
              page: null,
              title: null,
              url: source.url,
            }));
          }
        }}
        onSetTags={(tags) => setRecipe((prev) => ({ ...prev, tags }))}
        onSetRating={(rating) => setRecipe((prev) => ({ ...prev, rating }))}
        onSetDuration={(duration) =>
          setRecipe((prev) => ({ ...prev, duration }))
        }
        onSetNote={(notes) => setRecipe((prev) => ({ ...prev, notes }))}
        onAddedIngredient={(ingredient, quantity) => {
          setRecipe((prev) => ({
            ...prev,
            ingredients: [
              ...prev.ingredients,
              {
                ingredient,
                quantities: [parse(quantity)],
              },
            ],
          }));
        }}
        onRemoveIngredient={(name) => {
          setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter(
              (i) => i.ingredient.name !== name,
            ),
          }));
        }}
        onChangeQuantity={(name, quantity) => {
          setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.map((i) => {
              if (i.ingredient.name === name) {
                const q = parse(quantity);
                return { ...i, quantities: [q] };
              }
              return i;
            }),
          }));
        }}
      />
    </RecipeContext.Provider>
  );
}
