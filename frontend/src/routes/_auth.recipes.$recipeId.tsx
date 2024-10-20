import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useAddMealToPlan } from "../apis/mealplans.ts";
import {
  type Source,
  addRecipeToShoppinglist,
  useAddIngredient,
  useDeleteIngredient,
  useRecipe,
  useSetRecipeName,
  useSetRecipeNotes,
  useSetRecipeRating,
  useSetRecipeSource,
  useSetRecipeTags,
} from "../apis/recipes.ts";
import { RecipeContext, RecipeView } from "../components/smart/recipeView.tsx";

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

  const setRating = useSetRecipeRating(token, id);
  const setNotes = useSetRecipeNotes(token, id);
  const addIngredient = useAddIngredient(token, id);
  const removeIngredient = useDeleteIngredient(token, id);
  const setTags = useSetRecipeTags(token, id);
  const setName = useSetRecipeName(token, id);
  const setSource = useSetRecipeSource(token, id);

  // TODO: get rid of the 1
  const addMealToPlan = useAddMealToPlan(token, 1);
  const addRecipe = addRecipeToShoppinglist(token);

  // TODO: needs to be lower inside of layout... but we will get there
  if (data.isLoading) {
    return <p>Loading</p>;
  }

  if (!data.data) {
    return <p>Error</p>;
  }

  const recipe = data.data;

  return (
    <RecipeContext.Provider
      value={{
        editing: editing || false,
        token,
      }}
    >
      <RecipeView
        onSave={() => {
          navigate({ search: { editing: !editing } });
        }}
        recipe={recipe}
        onSetName={(name) => setName.mutate(name)}
        onSetSource={(source: Source) => {
          if (source.source === "book") {
            source.url = null;
          }
          if (source.source === "website") {
            source.page = null;
            source.title = null;
          }
          setSource.mutate(source);
        }}
        onSetTags={(tags) => setTags.mutate(tags)}
        onSetRating={(rating) => setRating.mutate(rating)}
        onSetNote={(notes) => setNotes.mutate(notes)}
        onAddedIngredient={(ingredient, quantity) => {
          addIngredient.mutate({ ingredient: ingredient.id, quantity });
        }}
        onRemoveIngredient={(name) => {
          const ing = recipe.ingredients.find((i) => i.name === name);
          if (ing) {
            removeIngredient.mutate({ ingredient: ing.id });
          }
        }}
        onAddtoMealPlan={() => {
          addMealToPlan.mutate({
            section: null,
            details: {
              type: "from_recipe",
              id: recipe.id,
            },
          });
        }}
        onAddToShoppinglist={(list) => {
          addRecipe.mutate({ recipeId: recipe.id, shoppinglistId: list });
        }}
      />
    </RecipeContext.Provider>
  );
}
