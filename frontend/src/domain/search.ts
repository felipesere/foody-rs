import { z } from "zod";
import type { Recipe } from "../apis/recipes.ts";

export const RecipeSearchSchemaParams = z.object({
  tags: z.array(z.string()).optional(),
  books: z.array(z.string()).optional(),
  terms: z.array(z.string()).optional(),
});
export type RecipeSearchParams = z.infer<typeof RecipeSearchSchemaParams>;

export function updateSearchParams(
  previous: RecipeSearchParams,
  changes: {
    books?: { set?: string[]; add?: string; remove?: string };
    tags?: { set?: string[]; add?: string; remove?: string };
    terms?: { add?: string; remove?: string };
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

  if (changes.terms?.add) {
    other.terms = [...(previous.terms || []), changes.terms.add];
  }

  if (changes.terms?.remove) {
    other.terms = (previous.terms || []).filter(
      (t) => t !== changes.terms?.remove,
    );
    if (other.terms.length === 0) {
      other.terms = undefined;
    }
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
    if (params.terms) {
      const terms = params.terms || [];
      if (terms.length > 0) {
        return terms.every((t) => {
          const term = t.toLowerCase();
          console.log(`Cehcking ${term}`);
          return (
            recipe.name.toLowerCase().includes(term) ||
            recipe.ingredients.some((i) =>
              i.ingredient.name.toLowerCase().includes(term),
            )
          );
        });
      }
    }
    return true;
  }

  return recipes.filter(tagsMatch).filter(termMatch).filter(booksMatch);
}
