import * as v from "valibot";
import { TimestampSchema } from "./index.ts";

const FromRecipe = v.strictObject({
  kind: v.literal("from_recipe"),
  id: v.number(),
});

const Untracked = v.strictObject({
  kind: v.literal("untracked"),
  name: v.string(),
});

const MealKind = v.union([FromRecipe, Untracked]);

const MealSchema = v.strictObject({
  kind: v.literal("mealplan_meal"),
  id: v.number(),
  details: MealKind,
  section: v.nullable(v.string()),
  is_cooked: v.boolean(),
  created_at: TimestampSchema,
});

export const MealplansSchema = v.strictObject({
  kind: v.literal("mealplan"),
  id: v.number(),
  name: v.string(),
  created_at: TimestampSchema,
  meals: v.array(MealSchema),
});

export type Mealplan = v.InferOutput<typeof MealplansSchema>;
