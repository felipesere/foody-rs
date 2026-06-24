import * as v from "valibot";
import { IngredientSchema, QuantitySchema } from "./shoppinglists.ts";
import { useQuery } from "@tanstack/react-query";
import { http } from "./index.ts";

const RecipeIngredientSchema = v.object({
  kind: v.literal("recipe_ingredient"),
  id: v.number(),
  ingredient: IngredientSchema,
  quantities: v.array(QuantitySchema),
});

export const RecipesBaseSchema = v.object({
  kind: v.literal("recipe"),
  id: v.number(),
  name: v.string(),
  tags: v.array(v.string()),
  rating: v.nullable(v.number()),
  notes: v.nullable(v.string()),
  duration: v.nullable(v.string()),
  ingredients: v.array(RecipeIngredientSchema),
});

const BookSchema = v.object({
  source: v.literal("book"),
  title: v.string(),
  page: v.number(),
  ...RecipesBaseSchema.entries,
});

const WebsiteSchema = v.object({
  source: v.literal("website"),
  url: v.nullable(v.string()),
  ...RecipesBaseSchema.entries,
});

export const RecipeSchema = v.union([BookSchema, WebsiteSchema]);

export type Recipe = v.InferOutput<typeof RecipeSchema>;

export const RecipesSchema = v.object({
  recipes: v.array(RecipeSchema),
});

export const client = {
  index: (token: string) => {
    return useQuery({
      queryKey: ["recipes"],
      queryFn: async () => {
        const body = await http
          .get("api/v1/recipes", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .json();

        return v.parse(RecipesSchema, body);
      },
    });
  },
};
