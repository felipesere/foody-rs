import { expect, test } from "vitest";
import type { Recipe } from "../api/v1/recipes.ts";
import type {
  ShoppinglistItem,
  StoredQuantity,
} from "../api/v1/shoppinglists.ts";
import { orderByRecipe } from "./orderByRecipe.ts";

function _ingredient(
  name: string,
  quantities: ShoppinglistItem["quantities"],
): ShoppinglistItem {
  return {
    kind: "shoppinglist_item",
    id: 1,
    note: null,
    in_basket: false,
    ingredient: {
      id: 1,
      kind: "ingredient",
      name,
      tags: [],
      aisle: null,
      storage: null,
    },
    quantities,
  };
}

function _quantity(recipe_id: number): StoredQuantity {
  return {
    id: 1,
    recipe_id,
    unit: "grams",
    value: null,
    text: null,
  };
}

test("groups ingredients and quantities into by their recipes", () => {
  const recipeNames: Record<
    NonNullable<StoredQuantity["recipe_id"]>,
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
      recipe_id: null, // <-- Makes this manually added!
      unit: "grams",
      value: null,
      text: null,
    },
  ]);

  const sections = orderByRecipe(
    [apples, bananas, carrots, manuallyAdded],
    recipeNames,
  );

  const smallSections = sections.map((section) => {
    return {
      name: section.name,
      ingredients: section.items.map((i) => i.ingredient.name),
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
