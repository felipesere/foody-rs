import * as v from "valibot";
import { Recipe } from "../api/v1/recipes.ts";

export const RecipeSearchSchemaParams = v.object({
  tags: v.optional(v.array(v.string())),
  books: v.optional(v.array(v.string())),
  terms: v.optional(v.array(v.string())),
  rating: v.optional(v.number()),
});
export type RecipeSearchParams = v.InferOutput<typeof RecipeSearchSchemaParams>;

export function updateSearchParams(
  previous: RecipeSearchParams,
  changes: {
    books?: { set?: string[]; add?: string; remove?: string };
    tags?: { set?: string[]; add?: string; remove?: string };
    terms?: { add?: string; remove?: string };
    ratings?: { set: number | undefined };
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

  if (changes.ratings) {
    const ratings = changes.ratings;
    other.rating = ratings.set;
  }

  return other;
}

export function filterRecipes(
  recipes: Recipe[],
  searchParams: RecipeSearchParams | undefined,
): Recipe[] {
  if (searchParams === undefined) {
    return recipes;
  }
  let params = searchParams;

  function tagsMatch(recipe: Recipe) {
    if (params.tags) {
      return (params.tags || []).every((t) => recipe.tags.includes(t));
    }
    return true;
  }

  function booksMatch(recipe: Recipe) {
    if (params.books && params.books.length > 0) {
      const books = params.books;
      switch (recipe.source) {
        case "book":
          return books.some((b) => recipe.title === b);
        case "website":
          return false;
      }
    }

    return true;
  }

  function ratingsMatch(recipe: Recipe) {
    if (params.rating && recipe.rating) {
      let rating = params.rating;
      return recipe.rating >= rating;
    }
    return true;
  }

  function termMatch(recipe: Recipe) {
    if (params.terms) {
      const terms = params.terms || [];
      if (terms.length > 0) {
        return terms.every((t) => {
          const term = t.toLowerCase();
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

  return recipes
    .filter(tagsMatch)
    .filter(termMatch)
    .filter(booksMatch)
    .filter(ratingsMatch);
}
