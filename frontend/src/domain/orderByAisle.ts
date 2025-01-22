import type { Aisle, Ingredient } from "../apis/ingredients.ts";
import type { ShoppinglistItem } from "../apis/shoppinglists.ts";
import type { Section } from "./tags.tsx";

export function orderByAisles(items: ShoppinglistItem[]): Section[] {
  const ingredientsByAisle: Record<
    NonNullable<Aisle["name"]>,
    { aisle: Aisle; ingredients: Ingredient[] }
  > = {};

  const noAisle: Ingredient[] = [];
  for (const { ingredient } of items) {
    if (!ingredient.aisle) {
      noAisle.push(ingredient);
    } else {
      const inAisle = ingredientsByAisle[ingredient.aisle.name] || {
        aisle: ingredient.aisle,
        ingredients: [],
      };
      inAisle.ingredients.push(ingredient);
      ingredientsByAisle[ingredient.aisle.name] = inAisle;
    }
  }

  const sections = Object.values(ingredientsByAisle)
    .sort((a, b) => a.aisle.order - b.aisle.order)
    .map((n) => {
      return {
        name: n.aisle.name,
        ingredients: n.ingredients,
      };
    });

  return []; // TODO

  // return [...sections, {
  //     name: "No Aisle",
  //     items: noAisle,
  // }]
}
