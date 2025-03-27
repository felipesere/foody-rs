import type { Aisle } from "../apis/ingredients.ts";

interface Item {
  ingredient: {
    name: string;
    aisle: Aisle | null;
  };
}

import type { Section } from "./orderByRecipe.ts";

export function orderByAisles<I extends Item>(items: I[]): Section<I>[] {
  const ingredientsByAisle: Record<
    NonNullable<Aisle["name"]>,
    { aisle: Aisle; ingredients: I[] }
  > = {};

  const noAisle: I[] = [];
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
      n.ingredients.sort((a, b) =>
        a.ingredient.name > b.ingredient.name ? 1 : -1,
      );
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
