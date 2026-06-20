import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";

export const IngredientSchema = v.object({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: v.nullable(AisleSchema),
});

export const IngredientsSchema = v.object({
  ingredients: v.array(IngredientSchema),
});
