import { expect, test } from "vitest";
import type { ShoppinglistItem } from "../apis/shoppinglists.ts";
import { orderByTags } from "./tags.tsx";

function _ingredient(name: string, tags: string[]): ShoppinglistItem {
  return {
    ingredient: {
      id: 1,
      name,
      tags,
      aisle: null,
    },
    quantities: [],
    note: null,
  };
}

test("groups ingredients based on tag order", () => {
  const ingredients: ShoppinglistItem[] = [
    _ingredient("apple", ["fruit"]),
    _ingredient("pear", ["fruit"]),
    _ingredient("broccoli", ["vegetable", "iron"]),
    _ingredient("foo", ["iron"]),
  ];

  const sections = orderByTags(ingredients);

  const names = sections.map((s) => s.items.map((i) => i.ingredient.name));

  expect(names).toEqual([["broccoli"], ["apple", "pear"], ["foo"]]);
});
