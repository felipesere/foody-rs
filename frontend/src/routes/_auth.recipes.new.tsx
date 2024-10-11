import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import {
  type Source,
  type UnstoredRecipe,
  useCreateRecipe,
} from "../apis/recipes.ts";
import { RecipeContext, RecipeView } from "../components/smart/recipeView.tsx";
import { parse } from "../quantities.ts";

export const Route = createFileRoute("/_auth/recipes/new")({
  component: NewRecipePage,
});

function NewRecipePage() {
  const { token } = Route.useRouteContext();

  // const createRecipe = useCreateRecipe(token);
  // const navigate = useNavigate({ from: "/recipes/new" });

  // const setRating = useSetRecipeRating(token, id);
  // const setNotes = useSetRecipeNotes(token, id);
  // const addIngredient = useAddIngredient(token, id);
  // const removeIngredient = useDeleteIngredient(token, id);

  // // TODO: get rid of the 1
  // const addMealToPlan = useAddMealToPlan(token, 1);
  // const addRecipe = addRecipeToShoppinglist(token);

  // const setTags = useSetRecipeTags(token, id);

  const [recipe, setRecipe] = useState<UnstoredRecipe>({
    ingredients: [],
    name: "",
    source: "book",
    rating: 0,
    tags: [],
    notes: "",
  });

  console.log(recipe);

  const n = useCreateRecipe(token);

  return (
    <RecipeContext.Provider value={{ editing: true, token }}>
      <RecipeView
        onSave={() => {
          n.mutate(recipe);
        }}
        recipe={recipe}
        onSetName={(name) => setRecipe((prev) => ({ ...prev, name }))}
        onSetSource={(source: Source) => {
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
        onSetNote={(notes) => setRecipe((prev) => ({ ...prev, notes }))}
        onAddedIngredient={(ingredient, quantity) => {
          setRecipe((prev) => ({
            ...prev,
            ingredients: [
              ...prev.ingredients,
              {
                ...ingredient,
                quantity: [parse(quantity)],
              },
            ],
          }));
          console.log("...");
        }}
        onRemoveIngredient={(name) => {
          setRecipe((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((i) => i.name !== name),
          }));
        }}
      />
    </RecipeContext.Provider>
  );
}
