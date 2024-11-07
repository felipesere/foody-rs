import { expect, test } from "vitest";
import type { Recipe } from "../apis/recipes.ts";
import { filterRecipes } from "./search.ts";

const recipes: Recipe[] = [
  {
    id: 1,
    name: "tartiflette",
    ingredients: [
      {
        id: 1,
        name: "potatoes",
        quantity: [
          {
            id: 1,
            unit: "kg",
            value: 1,
          },
        ],
      },
      {
        id: 2,
        name: "cheese",
        quantity: [
          {
            id: 2,
            unit: "g",
            value: 500,
          },
        ],
      },
    ],
    tags: ["winter", "tasty", "cheesy"],
    rating: 5,
    notes: "",
    source: "website",
    url: "https://somewhere.com",
    title: null,
    page: null,
    duration: null,
  },
  {
    id: 2,
    name: "blurb",
    ingredients: [
      {
        id: 3,
        name: "Strawberry",
        quantity: [
          {
            id: 3,
            unit: "kg",
            value: 1,
          },
        ],
      },
      {
        id: 4,
        name: "Sweet potato",
        quantity: [
          {
            id: 1,
            unit: "kg",
            value: 1,
          },
        ],
      },
    ],
    tags: ["winter", "weird"],
    rating: 4,
    notes: "",
    source: "website",
    url: "https://somewhere.com",
    title: null,
    page: null,
    duration: null,
  },
];

test("empty search returns all data", () => {
  const remaining = filterRecipes(recipes, {});

  expect(remaining.map((r) => r.name)).toEqual(["tartiflette", "blurb"]);
});

test("match single tag", () => {
  const remaining = filterRecipes(recipes, { tags: ["weird"] });
  expect(remaining.map((r) => r.name)).toEqual(["blurb"]);

  const other = filterRecipes(recipes, { tags: ["xxx"] });
  expect(other.map((r) => r.name)).toEqual([]);
});

test("multiple tags must match simultaneously", () => {
  const remaining = filterRecipes(recipes, { tags: ["weird", "winter"] });
  expect(remaining.map((r) => r.name)).toEqual(["blurb"]);

  const other = filterRecipes(recipes, { tags: ["weird", "cheesy"] });
  expect(other.map((r) => r.name)).toEqual([]);
});

test("terms can match in name", () => {
  const remaining = filterRecipes(recipes, { term: "tarti" });
  expect(remaining.map((r) => r.name)).toEqual(["tartiflette"]);

  const other = filterRecipes(recipes, { term: "TARTI" });
  expect(other.map((r) => r.name)).toEqual(["tartiflette"]);
});

test("terms can match in ingredient name", () => {
  const remaining = filterRecipes(recipes, { term: "sweet" });
  expect(remaining.map((r) => r.name)).toEqual(["blurb"]);
});
