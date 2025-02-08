import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { type Ingredient, useAllIngredients } from "../../apis/ingredients.ts";
import { useAddRecipeToMealplan } from "../../apis/mealplans.ts";
import {
  type Change,
  type Recipe,
  type Source,
  addRecipeToShoppinglist,
  useChangeRecipe,
  useRecipe,
} from "../../apis/recipes.ts";
import {
  RecipeContext,
  RecipeView,
} from "../../components/smart/recipeView.tsx";
import { parse } from "../../quantities.ts";

const RecipeSearch = z.object({
  editing: z.boolean().optional(),
});

export const Route = createFileRoute("/_auth/recipes/$recipeId")({
  component: RecipePage,
  validateSearch: RecipeSearch,
});

function RecipePage() {
  const { token } = Route.useRouteContext();
  const navigate = useNavigate({ from: Route.fullPath });

  const { editing } = Route.useSearch();
  const { recipeId } = Route.useParams();
  const id = Number(recipeId);

  const data = useRecipe(token, id);
  const ingredientData = useAllIngredients(token);

  const addMealToPlan = useAddRecipeToMealplan(token);
  const addRecipe = addRecipeToShoppinglist(token);
  const [changes, setChanges] = useState<Change[]>([]);
  const submitChanges = useChangeRecipe(token, id);

  // TODO: needs to be lower inside of layout... but we will get there
  if (data.isLoading || ingredientData.isLoading) {
    return <p>Loading</p>;
  }

  if (!data.data || !ingredientData.data) {
    return <p>Error</p>;
  }

  function applyChanges(
    changes: Change[],
    recipe: Recipe,
    knownIngredients: Ingredient[],
  ): Recipe {
    const copy = structuredClone(recipe);
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
        case "source":
          switch (change.value.type) {
            case "website":
              copy.source = "website";
              copy.url = change.value.url;
              copy.page = null;
              copy.title = null;
              break;
            case "book":
              copy.source = "book";
              copy.url = null;
              copy.page = change.value.page;
              copy.title = change.value.title;
              break;
          }
          break;
        case "rating":
          copy.rating = change.value;
          break;
        case "ingredients":
          switch (change.value.type) {
            case "remove":
              {
                const id = change.value.ingredient;
                copy.ingredients = copy.ingredients.filter(
                  (i) => i.ingredient.id !== id,
                );
              }
              break;
            case "add":
              {
                const id = change.value.id;
                const quantity = change.value.quantity;
                const ingredient = knownIngredients.find((i) => i.id === id);
                if (ingredient) {
                  copy.ingredients = [
                    ...copy.ingredients,
                    {
                      ingredient,
                      quantity: [{ ...parse(quantity), id: 1 }], // TODO: meh... non-stored quantity?
                    },
                  ];
                }
              }
              break;
            case "set":
              {
                for (const i of change.value.ingredients) {
                  const id = i.id;
                  const quantity = i.quantity;
                  const ingredient = knownIngredients.find((i) => i.id === id);
                  if (ingredient) {
                    copy.ingredients = [
                      ...copy.ingredients,
                      {
                        ingredient,
                        quantity: [{ ...parse(quantity), id: 1 }], // TODO: meh... non-stored quantity?
                      },
                    ];
                  }
                }
              }
              break;
          }
          break;
      }
    }
    return copy;
  }

  const recipe = applyChanges(changes, data.data, ingredientData.data);

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
          if (changes.length > 0 && editing) {
            submitChanges.mutate(changes);
            setChanges([]);
          }
          navigate({ search: { editing: !editing } });
        }}
        onCancel={() => {
          setChanges([]);
          navigate({ search: { editing: false } });
        }}
        onSetName={(name) => {
          setChanges((prev) => [...prev, { type: "name", value: name }]);
        }}
        onSetSource={(source: Source) => {
          if (source.source === "book") {
            setChanges((prev) => [
              ...prev,
              {
                type: "source",
                value: {
                  type: "book",
                  // biome-ignore lint/style/noNonNullAssertion: We know we are a `book` from the source check above
                  title: source.title!,
                  // biome-ignore lint/style/noNonNullAssertion: We know we are a `book` from the source check above
                  page: source.page!,
                },
              },
            ]);
          }
          if (source.source === "website") {
            setChanges((prev) => [
              ...prev,
              {
                type: "source",
                // biome-ignore lint/style/noNonNullAssertion: We know we are a `book` from the source check above
                value: { type: "website", url: source.url! },
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
        onAddToMealPlan={(id) => {
          addMealToPlan.mutate({
            mealPlan: id,
            details: {
              type: "from_recipe",
              id: recipe.id,
            },
          });
        }}
        onAddToShoppinglist={(id) => {
          addRecipe.mutate({ recipeId: recipe.id, shoppinglistId: id });
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
