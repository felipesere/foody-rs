import { expect, test } from "vitest";
import type { Recipe } from "../apis/recipes.ts";
import type { Ingredient, Quantity } from "../apis/shoppinglists.ts";
import { orderByRecipe } from "./orderByRecipe.ts";

function _ingredient(
  name: string,
  quantities: Ingredient["quantities"],
): Ingredient {
  return {
    id: 1,
    name,
    tags: [],
    quantities,
    note: null,
  };
}

function _quantity(recipe_id: number): Quantity {
  return {
    id: 1,
    in_basket: false,
    recipe_id,
    unit: "grams",
  };
}

test("groups ingredients and quantities into by their recipes", () => {
  const recipeNames: Record<
    NonNullable<Quantity["recipe_id"]>,
    Recipe["name"]
  > = {
    1: "Foo",
    2: "Bar",
    3: "Baz",
  };
  const apples = _ingredient("apple", [
    _quantity(1),
    _quantity(2),
    _quantity(3),
  ]);
  const bananas = _ingredient("banana", [_quantity(1)]);
  const carrots = _ingredient("carrot", [_quantity(3)]);
  const manuallyAdded = _ingredient("flour", [
    {
      id: 1,
      in_basket: false,
      recipe_id: null, // <-- Makes this manually added!
      unit: "grams",
    },
  ]);

  const sections = orderByRecipe(
    [apples, bananas, carrots, manuallyAdded],
    recipeNames,
  );

  const smallSections = sections.map((section) => {
    return {
      name: section.name,
      ingredients: section.ingredients.map((i) => i.name),
    };
  });

  expect(smallSections).toEqual([
    {
      ingredients: ["apple", "banana"],
      name: "Foo",
    },
    {
      ingredients: ["apple"],
      name: "Bar",
    },
    {
      ingredients: ["apple", "carrot"],
      name: "Baz",
    },
    {
      ingredients: ["flour"],
      name: "Manual",
    },
  ]);
});
