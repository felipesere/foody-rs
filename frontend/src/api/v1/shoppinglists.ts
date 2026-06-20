import * as v from "valibot";
import { http, TimestampSchema } from "./index.ts";
import { AisleSchema } from "./aisles.ts";
import { useQuery } from "@tanstack/react-query";

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

export const ShoppinglistSchema = v.object({
  id: v.number(),
  kind: v.literal("shoppinglist"),
  last_updated: TimestampSchema,
  ingredients: v.array(ShoppinglistItem),
});

export const SmallShoppinglist = v.object({
  kind: v.literal("shoppinglist"),
  id: v.number(),
  name: v.string(),
  last_updated: TimestampSchema,
});

export const ShoppinglistsSchema = v.object({
  shoppinglists: v.array(SmallShoppinglist),
});

export const client = function () {
  return {
    index: (token: string) => {
      return useQuery({
        queryKey: ["ingredients"],
        queryFn: async () => {
          const body = await http
            .get("api/v1/shoppinglists", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .json();

          return v.parse(ShoppinglistsSchema, body);
        },
      });
    },
  };
};
