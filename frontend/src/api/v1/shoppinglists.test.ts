import * as v from "valibot";
import { expect, test } from "vitest";
import shoppinglistFixture from "../../../test-fixtures/api/v1/shoppinglists/show.json";
import { ShoppinglistsSchema } from "./shoppinglists.ts";

test("show shoppinglist schema", () => {
  let outcome = v.safeParse(ShoppinglistsSchema, shoppinglistFixture);
  expect(outcome.success).toBe(true);
});
