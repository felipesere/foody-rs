import type { Recipe } from "../apis/recipes.ts";
import type {
  Quantity,
  ShoppinglistItem,
  ShoppinglistQuantity,
} from "../apis/shoppinglists.ts";

export type Section = {
  name: string;
  items: ShoppinglistItem[];
};

export function orderByRecipe(
  items: ShoppinglistItem[],
  recipeNames: Record<
    NonNullable<ShoppinglistQuantity["recipe_id"]>,
    Recipe["name"]
  >,
): Section[] {
  const ingredientsByRecipe: Record<
    NonNullable<Quantity["id"]>,
    ShoppinglistItem[]
  > = {};
  const noRecipe: ShoppinglistItem[] = [];
  for (const item of items) {
    for (const quantity of item.quantities) {
      if (quantity.recipe_id) {
        const ingredientInRecipe =
          ingredientsByRecipe[quantity.recipe_id] || [];
        ingredientInRecipe.push(item);
        ingredientsByRecipe[quantity.recipe_id] = ingredientInRecipe;
      } else {
        noRecipe.push(item);
      }
    }
  }
  const sections: Section[] = Object.entries(ingredientsByRecipe).map(
    ([id, ingredients]) => {
      const actualId = Number.parseInt(id, 10); // Iterating over properties yields strings, even tho the value was originally a number
      return {
        name: recipeNames[actualId] || "Unknown",
        items: ingredients,
      };
    },
  );
  if (noRecipe.length > 0) {
    sections.push({
      name: "Manual",
      items: noRecipe,
    });
  }
  return sections;
}
