import type { Recipe } from "../apis/recipes.ts";
import type { Ingredient, Quantity } from "../apis/shoppinglists.ts";
import type { Section } from "./tags.tsx";

export function orderByRecipe(
  ingredients: Ingredient[],
  recipeNames: Record<NonNullable<Quantity["recipe_id"]>, Recipe["name"]>,
): Section[] {
  const ingredientsByRecipe: Record<
    NonNullable<Quantity["id"]>,
    Ingredient[]
  > = {};
  const noRecipe: Ingredient[] = [];
  for (const ingredient of ingredients) {
    for (const quantity of ingredient.quantities) {
      if (quantity.recipe_id) {
        const ingredientInRecipe =
          ingredientsByRecipe[quantity.recipe_id] || [];
        ingredientInRecipe.push(ingredient);
        ingredientsByRecipe[quantity.recipe_id] = ingredientInRecipe;
      } else {
        noRecipe.push(ingredient);
      }
    }
  }
  const sections: Section[] = Object.entries(ingredientsByRecipe).map(
    ([id, ingredients]) => {
      const actualId = Number.parseInt(id, 10); // Iterating over properties yields strings, even tho the value was originally a number
      return {
        name: recipeNames[actualId] || "Unknown",
        ingredients,
      };
    },
  );
  if (noRecipe.length > 0) {
    sections.push({
      name: "Manual",
      ingredients: noRecipe,
    });
  }
  return sections;
}
