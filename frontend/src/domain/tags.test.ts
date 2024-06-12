import { expect, test } from "vitest";
import type { Ingredient } from "../apis/shoppinglists.ts";
import type { Tag } from "../apis/tags.ts";
import { lowestOrderedTag, orderByTags } from "./tags.tsx";

test("selects tag with lowest order", () => {
  const knownTags: Record<string, Tag> = {
    vegetable: {
      name: "vegetable",
      is_aisle: true,
      order: 1,
    },
    fruit: {
      name: "fruit",
      is_aisle: true,
      order: 2,
    },
    other: {
      name: "other",
      is_aisle: false,
    },
  };

  let order = lowestOrderedTag(["vegetable", "fruit"], knownTags);
  expect(order).toEqual("vegetable");

  order = lowestOrderedTag(["fruit"], knownTags);
  expect(order).toEqual("fruit");

  order = lowestOrderedTag(["other"], knownTags);
  expect(order).toEqual(undefined);

  order = lowestOrderedTag([], knownTags);
  expect(order).toEqual(undefined);
});

function _ingredient(name: string, tags: string[]): Ingredient {
  return {
    id: 1,
    name,
    tags,
    quantities: [],
    note: null,
  };
}

test("groups ingredients based on tag order", () => {
  const ingredients: Ingredient[] = [
    _ingredient("apple", ["fruit"]),
    _ingredient("pear", ["fruit"]),
    _ingredient("broccoli", ["vegetable", "iron"]),
    _ingredient("foo", ["iron"]),
  ];

  const knownTags: Record<string, Tag> = {
    vegetable: {
      name: "vegetable",
      is_aisle: true,
      order: 1,
    },
    fruit: {
      name: "fruit",
      is_aisle: true,
      order: 3,
    },
    iron: {
      name: "iron",
      is_aisle: false,
    },
  };

  const sections = orderByTags(ingredients, knownTags);

  const names = sections.map((s) => s.ingredients.map((i) => i.name));

  expect(names).toEqual([["broccoli"], ["apple", "pear"], ["foo"]]);
});
