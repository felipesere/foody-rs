import * as v from "valibot";
import { expect, test } from "vitest";
import storagesFixtures from "../../../test-fixtures/api/v1/storages/index.json";
import { printIssues } from "./index.ts";
import { StoragesSchema } from "./storages.ts";

test("show storage schema", () => {
  let outcome = v.safeParse(StoragesSchema, storagesFixtures);
  expect(outcome.success, printIssues(outcome)).toBe(true);
});
