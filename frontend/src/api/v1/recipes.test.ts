import * as v from "valibot";
import { expect, test } from "vitest";
import recipesFixture from "../../../test-fixtures/api/v1/recipes/show.json";
import websiteRecipesFixture from "../../../test-fixtures/api/v1/recipes/show--website.json";
import { printIssues } from "./index.ts";
import { RecipeSchema } from "./recipes.ts";

test("show recipe schema", () => {
  let outcome = v.safeParse(RecipeSchema, recipesFixture);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});

test("website recipe schema", () => {
  let outcome = v.safeParse(RecipeSchema, websiteRecipesFixture);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
