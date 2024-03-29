import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { QuantitySchema } from "./recipes.ts";

const MinimalShoppinglistSchema = z.object({
  id: z.number(),
  name: z.string(),
  last_updated: z.string().datetime(),
});
const AllShoppinglistsSchema = z.object({
  shoppinglists: z.array(MinimalShoppinglistSchema),
});

export function useAllShoppinglists(token: string) {
  return useQuery({
    queryKey: ["shoppinglists"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/shoppinglists", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await response.json();
      return AllShoppinglistsSchema.parse(body);
    },
  });
}

const ItemQuantitySchema = QuantitySchema.extend({
  in_basket: z.boolean(),
  recipe_id: z.nullable(z.number()),
});
export type ItemQuantity = z.infer<typeof ItemQuantitySchema>;

const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantities: z.array(ItemQuantitySchema),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

const ShoppinglistSchema = z.object({
  id: z.number(),
  name: z.string(),
  last_updated: z.string().datetime(),
  ingredients: z.array(IngredientSchema),
});

export type Shoppinglist = z.infer<typeof ShoppinglistSchema>;

export function useShoppinglist(token: string, shoppinglistId: string) {
  return useQuery({
    queryKey: ["shoppinglist", shoppinglistId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/api/shoppinglists/${shoppinglistId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const body = await response.json();
      return ShoppinglistSchema.parse(body);
    },
  });
}
