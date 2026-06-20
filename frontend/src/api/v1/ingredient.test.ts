import * as v from "valibot";
import { expect, test } from "vitest";
import ingredientIndexFixtures from "../../../test-fixtures/api/v1/ingredients/index.json";
import ingredientShowFixtures from "../../../test-fixtures/api/v1/ingredients/show.json";
import ingredientWithoutAisleFixtures from "../../../test-fixtures/api/v1/ingredients/show--no-aisle.json";
import { printIssues } from "./index.ts";
import { IngredientSchema, IngredientsSchema } from "./ingredient.ts";

test("index ingredient schema", () => {
  let outcome = v.safeParse(IngredientsSchema, ingredientIndexFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});

test("show ingredient schema", () => {
  let outcome = v.safeParse(IngredientSchema, ingredientShowFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});

test("ingredient without aisle schema", () => {
  let outcome = v.safeParse(IngredientSchema, ingredientWithoutAisleFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
