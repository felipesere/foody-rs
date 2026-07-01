import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as v from "valibot";
import { type Ingredient, useIngredients } from "../../api/v1/ingredient.ts";
import { useAddMeal } from "../../api/v1/mealplans.ts";
import {
  type Recipe,
  type RecipeUpdate,
  type UnstoredRecipe,
  useAddRecipeIngredient,
  useRecipe,
  useRemoveRecipeIngredient,
  useUpdateRecipe,
} from "../../api/v1/recipes.ts";
import { useAddRecipe } from "../../api/v1/shoppinglists.ts";
import {
  RecipeContext,
  RecipeView,
} from "../../components/smart/recipeView.tsx";
import { parse } from "../../quantities.ts";

const RecipeSearch = v.object({
  editing: v.optional(v.boolean()),
});

export const Route = createFileRoute("/_auth/recipes/$recipeId")({
  component: RecipePage,
  validateSearch: RecipeSearch,
});

// Local edit-accumulator model: edits are collected client-side so we can
// preview them, then flushed to the v1 endpoints on save.
type Change =
  | { type: "name"; value: string }
  | { type: "tags"; value: string[] }
  | { type: "notes"; value: string }
  | { type: "duration"; value: string }
  | { type: "rating"; value: number }
  | {
      type: "source";
      value:
        | { type: "book"; title: string; page: number }
        | { type: "website"; url: string };
    }
  | {
      type: "ingredients";
      value:
        | { type: "add"; id: number; quantity: string }
        | { type: "remove"; ingredient: number };
    };

function toUnstored(recipe: Recipe): UnstoredRecipe {
  const { ingredients, ...rest } = recipe;
  return {
    ...rest,
    ingredients: ingredients.map((ri) => ({
      ingredient: ri.ingredient,
      quantity: ri.quantities,
    })),
  };
}

function applyChanges(
  changes: Change[],
  base: UnstoredRecipe,
  knownIngredients: Ingredient[],
): UnstoredRecipe {
  let copy = structuredClone(base);
  for (const change of changes) {
    switch (change.type) {
      case "name":
        copy.name = change.value;
        break;
      case "tags":
        copy.tags = change.value;
        break;
      case "notes":
        copy.notes = change.value;
        break;
      case "duration":
        copy.duration = change.value;
        break;
      case "rating":
        copy.rating = change.value;
        break;
      case "source":
        copy =
          change.value.type === "website"
            ? {
                ...copy,
                source: "website",
                url: change.value.url,
                title: null,
                page: null,
              }
            : {
                ...copy,
                source: "book",
                title: change.value.title,
                page: change.value.page,
                url: null,
              };
        break;
      case "ingredients":
        if (change.value.type === "remove") {
          const id = change.value.ingredient;
          copy = {
            ...copy,
            ingredients: copy.ingredients.filter((i) => i.ingredient.id !== id),
          };
        } else {
          const add = change.value;
          const ingredient = knownIngredients.find((i) => i.id === add.id);
          if (ingredient) {
            copy = {
              ...copy,
              ingredients: [
                ...copy.ingredients,
                { ingredient, quantity: [parse(add.quantity)] },
              ],
            };
          }
        }
        break;
    }
  }
  return copy;
}

function RecipePage() {
  const { token } = Route.useRouteContext();
  const navigate = useNavigate({ from: Route.fullPath });

  const { editing } = Route.useSearch();
  const { recipeId } = Route.useParams();
  const id = Number(recipeId);

  const recipeData = useRecipe(token, id);
  const ingredientData = useIngredients(token);

  const addMealToPlan = useAddMeal(token);
  const addRecipe = useAddRecipe(token);
  const updateRecipe = useUpdateRecipe(token);
  const addIngredient = useAddRecipeIngredient(token);
  const removeIngredient = useRemoveRecipeIngredient(token);

  const [changes, setChanges] = useState<Change[]>([]);

  // TODO: needs to be lower inside of layout... but we will get there
  if (recipeData.isLoading || ingredientData.isLoading) {
    return <p>Loading</p>;
  }

  if (!recipeData.data || !ingredientData.data) {
    return <p>Error</p>;
  }

  const knownIngredients = ingredientData.data.ingredients;
  const recipe = applyChanges(
    changes,
    toUnstored(recipeData.data),
    knownIngredients,
  );

  // Translate the accumulated changes into v1 calls: field edits collapse into
  // a single recipe PUT, ingredient edits become add/remove calls.
  async function flushChanges() {
    const update: RecipeUpdate = { recipeId: id };
    let hasFieldChange = false;
    const ingredientOps: Array<() => Promise<unknown>> = [];

    for (const change of changes) {
      switch (change.type) {
        case "name":
          update.name = change.value;
          hasFieldChange = true;
          break;
        case "tags":
          update.tags = change.value;
          hasFieldChange = true;
          break;
        case "notes":
          update.notes = change.value;
          hasFieldChange = true;
          break;
        case "duration":
          update.duration = change.value;
          hasFieldChange = true;
          break;
        case "rating":
          update.rating = change.value;
          hasFieldChange = true;
          break;
        case "source":
          update.source =
            change.value.type === "book"
              ? {
                  source: "book",
                  title: change.value.title,
                  page: change.value.page,
                }
              : { source: "website", url: change.value.url };
          hasFieldChange = true;
          break;
        case "ingredients":
          if (change.value.type === "add") {
            const { id: ingredient_id, quantity } = change.value;
            ingredientOps.push(() =>
              addIngredient.mutateAsync({ recipeId: id, ingredient_id, quantity }),
            );
          } else {
            const ingredientId = change.value.ingredient;
            ingredientOps.push(() =>
              removeIngredient.mutateAsync({ recipeId: id, ingredientId }),
            );
          }
          break;
      }
    }

    if (hasFieldChange) {
      await updateRecipe.mutateAsync(update);
    }
    for (const op of ingredientOps) {
      await op();
    }
  }

  async function handleSave() {
    if (changes.length > 0 && editing) {
      await flushChanges();
      setChanges([]);
    }
    await navigate({ search: { editing: !editing } });
  }

  return (
    <RecipeContext.Provider
      value={{
        editing: editing || false,
        token,
      }}
    >
      <RecipeView
        recipe={recipe}
        onSave={() => {
          void handleSave();
        }}
        onCancel={() => {
          setChanges([]);
          navigate({ search: { editing: false } });
        }}
        onSetName={(name) => {
          setChanges((prev) => [...prev, { type: "name", value: name }]);
        }}
        onSetSource={(source) => {
          if (source.source === "book") {
            setChanges((prev) => [
              ...prev,
              {
                type: "source",
                value: {
                  type: "book",
                  title: source.title,
                  page: source.page,
                },
              },
            ]);
          } else {
            setChanges((prev) => [
              ...prev,
              {
                type: "source",
                value: { type: "website", url: source.url },
              },
            ]);
          }
        }}
        onSetTags={(tags) =>
          setChanges((prev) => [...prev, { type: "tags", value: tags }])
        }
        onSetRating={(rating) =>
          setChanges((prev) => [...prev, { type: "rating", value: rating }])
        }
        onSetDuration={(duration) =>
          setChanges((prev) => [...prev, { type: "duration", value: duration }])
        }
        onSetNote={(notes) =>
          setChanges((prev) => [...prev, { type: "notes", value: notes }])
        }
        onAddedIngredient={(ingredient, quantity) => {
          setChanges((prev) => [
            ...prev,
            {
              type: "ingredients",
              value: {
                type: "add",
                id: ingredient.id,
                quantity: quantity,
              },
            },
          ]);
        }}
        onRemoveIngredient={(name) => {
          const ing = recipe.ingredients.find(
            (i) => i.ingredient.name === name,
          );
          if (ing) {
            setChanges((prev) => [
              ...prev,
              {
                type: "ingredients",
                value: {
                  type: "remove",
                  ingredient: ing.ingredient.id,
                },
              },
            ]);
          }
        }}
        onAddToMealPlan={(mealplanId) => {
          addMealToPlan.mutate({
            mealplanId,
            details: {
              kind: "from_recipe",
              id,
            },
          });
        }}
        onAddToShoppinglist={(shoppinglistId) => {
          addRecipe.mutate({ recipeId: id, shoppinglistId });
        }}
        onChangeQuantity={(name, quantity) => {
          const ing = recipe.ingredients.find(
            (i) => i.ingredient.name === name,
          );
          if (ing) {
            setChanges((prev) => [
              ...prev,
              {
                type: "ingredients",
                value: {
                  type: "remove",
                  ingredient: ing.ingredient.id,
                },
              },
              {
                type: "ingredients",
                value: {
                  type: "add",
                  id: ing.ingredient.id,
                  quantity: quantity,
                },
              },
            ]);
          }
        }}
      />
    </RecipeContext.Provider>
  );
}
