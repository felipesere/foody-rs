import { z } from "zod";
import type { Recipe } from "../apis/recipes.ts";

export const RecipeSearchSchemaParams = z.object({
  tags: z.array(z.string()).optional(),
  books: z.array(z.string()).optional(),
  term: z.string().optional(),
});
export type RecipeSearchParams = z.infer<typeof RecipeSearchSchemaParams>;

export function updateSearchParams(
  previous: RecipeSearchParams,
  changes: {
    books?: { set?: string[]; add?: string; remove?: string };
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

  if (changes.books?.set) {
    previous.books = changes.books.set;
  }

  if (changes.books?.add) {
    previous.books = [...(previous.books || []), changes.books.add];
  }

  if (changes.books?.remove) {
    previous.books = (previous.books || []).filter(
      (t) => t !== changes.books?.remove,
    );
    if (previous.books.length === 0) {
      previous.books = undefined;
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
    if (params.tags) {
      return (params.tags || []).every((t) => recipe.tags.includes(t));
    }
    return true;
  }

  function booksMatch(recipe: Recipe) {
    if (params.books) {
      const books = params.books || [];
      if (books.length > 0 && recipe.source === "website") {
        return false;
      }

      return books.some((b) => recipe.title === b);
    }

    return true;
  }

  function termMatch(recipe: Recipe) {
    if (params.term) {
      const term = params.term.toLowerCase();
      return (
        recipe.name.toLowerCase().includes(term) ||
        recipe.ingredients.some((i) => i.name.toLowerCase().includes(term))
      );
    }
    return true;
  }

  return recipes.filter(tagsMatch).filter(termMatch).filter(booksMatch);
}
