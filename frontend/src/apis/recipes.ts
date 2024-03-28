import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

export const QuantitySchema = z.object({
  unit: z.string(),
  value: z.number().optional(),
  text: z.string().optional(),
  id: z.number(),
});
export type Quantity = z.infer<typeof QuantitySchema>;

export function format(q: Quantity): string {
  if (q.unit === "arbitrary" && q.text) {
    return q.text;
  }
  return `${q.value}${q.unit}`;
}

const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantity: z.array(QuantitySchema),
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

export function useAllRecipes(token: string) {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/recipes", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await response.json();
      return RecipesSchema.parse(body);
    },
  });
}
