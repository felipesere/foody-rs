import * as v from "valibot";
import { expect, test } from "vitest";
import shoppinglistIndexFixture from "../../../test-fixtures/api/v1/shoppinglists/index.json";
import shoppinglistShowFixture from "../../../test-fixtures/api/v1/shoppinglists/show.json";
import { printIssues } from "./index.ts";
import { ShoppinglistSchema, ShoppinglistsSchema } from "./shoppinglists.ts";

test("show shoppinglist schema", () => {
  let outcome = v.safeParse(ShoppinglistSchema, shoppinglistShowFixture);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});

test("index shoppinglist schema", () => {
  let outcome = v.safeParse(ShoppinglistsSchema, shoppinglistIndexFixture);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
