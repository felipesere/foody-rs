import * as v from "valibot";
import { http, TimestampSchema } from "./index.ts";
import { AisleSchema } from "./aisles.ts";
import { useQuery } from "@tanstack/react-query";

export const QuantitySchema = v.object({
  unit: v.string(),
  value: v.nullable(v.number()),
  text: v.nullable(v.string()),
});

export const StoredQuantitySchema = v.object({
  id: v.number(),
  recipe_id: v.nullable(v.number()),
  ...QuantitySchema.entries,
});

export type Quantity = v.InferOutput<typeof QuantitySchema>;
export type StoredQuantity = v.InferOutput<typeof StoredQuantitySchema>;

export const IngredientSchema = v.object({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: v.nullable(AisleSchema),
});

export const ShoppinglistItemSchema = v.object({
  kind: v.literal("shoppinglist_item"),
  id: v.number(),
  note: v.nullable(v.string()),
  in_basket: v.boolean(),
  ingredient: IngredientSchema,
  quantities: v.array(StoredQuantitySchema),
});

export type ShoppinglistItem = v.InferOutput<typeof ShoppinglistItemSchema>;

export const ShoppinglistSchema = v.object({
  id: v.number(),
  kind: v.literal("shoppinglist"),
  last_updated: TimestampSchema,
  ingredients: v.array(ShoppinglistItemSchema),
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
    show: (token: string, shoppinglistId: number) => {
      return useQuery({
        queryKey: ["shoppinglist", shoppinglistId],
        refetchInterval: 2000, // ms
        refetchIntervalInBackground: true,
        queryFn: async () => {
          const body = await http
            .get(`api/v1/shoppinglists/${shoppinglistId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .json();

          return v.parse(ShoppinglistSchema, body);
        },
      });
    },
  };
};
