import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";
import type { Shoppinglist } from "./shoppinglists.ts";

export const WithIdSchema = z.object({
  id: z.number(),
});

const QuantitySchema = z.object({
  unit: z.string(),
  value: z.number().optional(),
  text: z.string().optional(),
});
export type Quantity = z.infer<typeof QuantitySchema>;

export const StoredQuantitySchema = WithIdSchema.merge(QuantitySchema);

export type StoredQuantity = z.infer<typeof StoredQuantitySchema>;

const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantity: z.array(StoredQuantitySchema),
});

const BookSchema = z.object({
  id: z.number(),
  name: z.string(),
  source: z.literal("book"),
  title: z.string(),
  page: z.number(),
  ingredients: z.array(IngredientSchema),
});

const WebsiteSchema = z.object({
  id: z.number(),
  name: z.string(),
  source: z.literal("website"),
  url: z.string(),
  ingredients: z.array(IngredientSchema),
});

const RecipeSchema = z.discriminatedUnion("source", [
  BookSchema,
  WebsiteSchema,
]);

export type Recipe = z.infer<typeof RecipeSchema>;
export type Website = z.infer<typeof WebsiteSchema>;
export type Book = z.infer<typeof BookSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipesSchema = z.object({
  recipes: z.array(RecipeSchema),
});

export type AddRecipeParams = {
  recipeId: Recipe["id"];
  shoppinglistId: Shoppinglist["id"];
};

export function addRecipeToShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipeId, shoppinglistId }: AddRecipeParams) => {
      return http.post(
        `api/shoppinglists/${shoppinglistId}/recipe/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSettled: (_data, _err, { shoppinglistId }) => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
  });
}

export function useAllRecipes(token: string) {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const body = await http
        .get("api/recipes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return RecipesSchema.parse(body);
    },
  });
}

export function useRecipe(token: string, id: Recipe["id"]) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const body = await http
        .get(`api/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return RecipeSchema.parse(body);
    },
  });
}
