import * as v from "valibot";
import { expect, test } from "vitest";
import meShowFixture from "../../../test-fixtures/api/v1/me/show.json";
import { printIssues } from "./index.ts";
import { UserSchema } from "./session.ts";

test("me schema", () => {
  let outcome = v.safeParse(UserSchema, meShowFixture);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
