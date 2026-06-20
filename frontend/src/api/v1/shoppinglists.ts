import * as v from "valibot";
import { TimestampSchema } from "./global.ts";
import { AisleSchema } from "./aisles.ts";

export const QuantitySchema = v.object({
  id: v.nullable(v.number()),
  unit: v.literal("gram"),
  value: v.nullable(v.number()),
  text: v.nullable(v.string()),
  recipe_id: v.nullable(v.number()),
});

export const IngredientSchema = v.object({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: AisleSchema,
});

export const ShoppinglistItem = v.object({
  kind: v.literal("shoppinglist_item"),
  id: v.number(),
  note: v.nullable(v.string()),
  in_basket: v.boolean(),
  ingredient: IngredientSchema,
  quantities: v.array(QuantitySchema),
});

export const ShoppinglistsSchema = v.object({
  id: v.number(),
  kind: v.literal("shoppinglist"),
  last_updated: TimestampSchema,
  ingredients: v.array(ShoppinglistItem),
});
