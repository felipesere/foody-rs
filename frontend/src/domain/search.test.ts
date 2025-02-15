import { expect, test } from "vitest";
import type { Recipe } from "../apis/recipes.ts";
import { filterRecipes } from "./search.ts";

const recipes: Recipe[] = [
  {
    id: 1,
    name: "tartiflette",
    ingredients: [
      {
        ingredient: {
          id: 1,
          name: "potatoes",
          tags: [],
          aisle: null,
        },
        quantity: [
          {
            id: 1,
            unit: "kg",
            value: 1,
          },
        ],
      },
      {
        ingredient: {
          id: 2,
          name: "cheese",
          tags: [],
          aisle: null,
        },
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
        ingredient: {
          id: 3,
          name: "Strawberry",
          tags: [],
          aisle: null,
        },
        quantity: [
          {
            id: 3,
            unit: "kg",
            value: 1,
          },
        ],
      },
      {
        ingredient: {
          id: 4,
          name: "Sweet potato",
          tags: [],
          aisle: null,
        },
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
    source: "book",
    url: null,
    title: "simplissime",
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
  const remaining = filterRecipes(recipes, { terms: ["tarti"] });
  expect(remaining.map((r) => r.name)).toEqual(["tartiflette"]);

  const other = filterRecipes(recipes, { terms: ["TARTI"] });
  expect(other.map((r) => r.name)).toEqual(["tartiflette"]);
});

test("terms can match in ingredient name", () => {
  const remaining = filterRecipes(recipes, { terms: ["sweet"] });
  expect(remaining.map((r) => r.name)).toEqual(["blurb"]);
});

test("books match", () => {
  const remaining = filterRecipes(recipes, { books: ["simplissime"] });
  expect(remaining.map((r) => r.name)).toEqual(["blurb"]);
});
