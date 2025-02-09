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
  const other = structuredClone(previous);
  if (changes.tags?.set) {
    other.tags = changes.tags.set;
  }

  if (changes.tags?.add) {
    other.tags = [...(previous.tags || []), changes.tags.add];
  }

  if (changes.tags?.remove) {
    other.tags = (previous.tags || []).filter(
      (t) => t !== changes.tags?.remove,
    );
    if (other.tags.length === 0) {
      other.tags = undefined;
    }
  }

  if (changes.books?.set) {
    other.books = changes.books.set;
  }

  if (changes.books?.add) {
    other.books = [...(previous.books || []), changes.books.add];
  }

  if (changes.books?.remove) {
    other.books = (previous.books || []).filter(
      (t) => t !== changes.books?.remove,
    );
    if (other.books.length === 0) {
      other.books = undefined;
    }
  }

  if (changes.term) {
    other.term = changes.term.set;
  }

  return other;
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
        recipe.ingredients.some((i) =>
          i.ingredient.name.toLowerCase().includes(term),
        )
      );
    }
    return true;
  }

  return recipes.filter(tagsMatch).filter(termMatch).filter(booksMatch);
}
