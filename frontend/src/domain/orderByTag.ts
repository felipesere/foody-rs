import type { Ingredient } from "../apis/ingredients.ts";
import type { Section } from "./orderByRecipe.ts";

export function orderByTag(items: Ingredient[]): Section<Ingredient>[] {
  const ingredientsByTag: Record<NonNullable<string>, Ingredient[]> = {};

  for (const item of items) {
    if (item.tags.length === 0) {
      const existing = ingredientsByTag.untagged || [];
      existing.push(item);
      ingredientsByTag.untagged = existing;

      // no need to further process this item...
      continue;
    }
    for (const tag of item.tags) {
      const existing = ingredientsByTag[tag] || [];
      existing.push(item);
      ingredientsByTag[tag] = existing;
    }
  }

  return Object.entries(ingredientsByTag).map(([tag, ingredients]) => {
    return {
      name: tag,
      items: ingredients,
    };
  });
}
