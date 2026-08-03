import { expect, test } from "vitest";
import type { Recipe } from "../api/v1/recipes.ts";
import { filterRecipes } from "./search.ts";

const recipes: Recipe[] = [
  {
    kind: "recipe",
    id: 1,
    name: "tartiflette",
    ingredients: [
      {
        kind: "recipe_ingredient",
        id: 1,
        ingredient: {
          id: 1,
          kind: "ingredient",
          name: "potatoes",
          tags: [],
          aisle: null,
          storage: null,
        },
        quantities: [{ unit: "kg", value: 1, text: null }],
      },
      {
        kind: "recipe_ingredient",
        id: 2,
        ingredient: {
          id: 2,
          kind: "ingredient",
          name: "cheese",
          tags: [],
          aisle: null,
          storage: null,
        },
        quantities: [{ unit: "g", value: 500, text: null }],
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
    kind: "recipe",
    id: 2,
    name: "blurb",
    ingredients: [
      {
        kind: "recipe_ingredient",
        id: 3,
        ingredient: {
          id: 3,
          kind: "ingredient",
          name: "Strawberry",
          tags: [],
          aisle: null,
          storage: null,
        },
        quantities: [{ unit: "kg", value: 1, text: null }],
      },
      {
        kind: "recipe_ingredient",
        id: 4,
        ingredient: {
          id: 4,
          kind: "ingredient",
          name: "Sweet potato",
          tags: [],
          aisle: null,
          storage: null,
        },
        quantities: [{ unit: "kg", value: 1, text: null }],
      },
    ],
    tags: ["winter", "weird"],
    rating: 4,
    notes: "",
    source: "book",
    url: null,
    title: "simplissime",
    page: 1,
    duration: null,
  },
];

test("undefined search returns all data", () => {
  const remaining = filterRecipes(recipes, undefined);

  expect(remaining.map((r) => r.name)).toEqual(["tartiflette", "blurb"]);
});

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

test("ratings at least as good", () => {
  const remaining = filterRecipes(recipes, { rating: 5 });
  expect(remaining.map((r) => r.name)).toEqual(["tartiflette"]);
});

test("ratings at least as good, lower threshold", () => {
  const remaining = filterRecipes(recipes, { rating: 3 });
  expect(remaining.map((r) => r.name)).toEqual(["tartiflette", "blurb"]);
});

test("unrated recipes are excluded when filtering by rating", () => {
  const withUnrated: Recipe[] = [
    ...recipes,
    { ...recipes[0], id: 3, name: "unrated", rating: null },
  ];
  const remaining = filterRecipes(withUnrated, { rating: 3 });
  expect(remaining.map((r) => r.name)).toEqual(["tartiflette", "blurb"]);
});
