import * as v from "valibot";
import { expect, test } from "vitest";
import aislesFixtures from "../../../test-fixtures/api/v1/aisles/index.json";
import { printIssues } from "./index.ts";
import { AislesSchema } from "./aisles.ts";

test("show mealplan schema", () => {
  let outcome = v.safeParse(AislesSchema, aislesFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
