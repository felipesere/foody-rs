import type { Aisle } from "../apis/ingredients.ts";
import type { ShoppinglistItem } from "../apis/shoppinglists.ts";
import type { Section } from "./tags.tsx";

export function orderByAisles(items: ShoppinglistItem[]): Section[] {
  const ingredientsByAisle: Record<
    NonNullable<Aisle["name"]>,
    { aisle: Aisle; ingredients: ShoppinglistItem[] }
  > = {};

  const noAisle: ShoppinglistItem[] = [];
  for (const item of items) {
    const ingredient = item.ingredient;
    if (!ingredient.aisle) {
      noAisle.push(item);
    } else {
      const inAisle = ingredientsByAisle[ingredient.aisle.name] || {
        aisle: ingredient.aisle,
        ingredients: [],
      };
      inAisle.ingredients.push(item);
      ingredientsByAisle[ingredient.aisle.name] = inAisle;
    }
  }

  const sections = Object.values(ingredientsByAisle)
    .sort((a, b) => a.aisle.order - b.aisle.order)
    .map((n) => {
      return {
        name: n.aisle.name,
        items: n.ingredients,
      };
    });

  return [
    ...sections,
    {
      name: "No Aisle",
      items: noAisle,
    },
  ];
}
