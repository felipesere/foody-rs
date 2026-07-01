import * as v from "valibot";
import { expect, test } from "vitest";
import mealplanFixtures from "../../../test-fixtures/api/v1/mealplans/show.json";
import { printIssues } from "./index.ts";
import { MealplanSchema } from "./mealplans.ts";

test("show mealplan schema", () => {
  let outcome = v.safeParse(MealplanSchema, mealplanFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
