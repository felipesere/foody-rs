import { z } from "zod";
import type { Recipe } from "../apis/recipes.ts";

export const RecipeSearchSchemaParams = z.object({
  tags: z.array(z.string()).optional(),
  term: z.string().optional(),
});
export type RecipeSearchParams = z.infer<typeof RecipeSearchSchemaParams>;

export function updateSearchParams(
  previous: RecipeSearchParams,
  changes: {
    tags?: { set?: string[]; add?: string; remove?: string };
    term?: { set?: string };
  },
): RecipeSearchParams {
  if (changes.tags?.set) {
    previous.tags = changes.tags.set;
  }

  if (changes.tags?.add) {
    previous.tags = [...(previous.tags || []), changes.tags.add];
  }

  if (changes.tags?.remove) {
    previous.tags = (previous.tags || []).filter(
      (t) => t !== changes.tags?.remove,
    );
    if (previous.tags.length === 0) {
      previous.tags = undefined;
    }
  }

  if (changes.term) {
    previous.term = changes.term.set;
  }

  return previous;
}

export function filterRecipes(
  recipes: Recipe[],
  params: RecipeSearchParams,
): Recipe[] {
  function tagsMatch(recipe: Recipe) {
    return (params.tags || []).every((t) => recipe.tags.includes(t));
  }

  function recipeNameMatch(recipe: Recipe) {
    return recipe.name.toLowerCase().includes(params.term?.toLowerCase() || "");
  }

  function ingredientsNameMatch(recipe: Recipe) {
    if (params.term === undefined) {
      return true;
    }
    return recipe.ingredients.some((i) =>
      i.name.toLowerCase().includes(params.term?.toLowerCase() || ""),
    );
  }

  return recipes.filter((recipe) => {
    return (
      tagsMatch(recipe) &&
      (recipeNameMatch(recipe) || ingredientsNameMatch(recipe))
    );
  });
}
