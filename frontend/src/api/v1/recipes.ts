import * as v from "valibot";
import { IngredientSchema, Quantity, QuantitySchema } from "./shoppinglists.ts";
import { useQuery } from "@tanstack/react-query";
import { http } from "./index.ts";
import type { Ingredient } from "../../apis/ingredients.ts";

const RecipeIngredientSchema = v.strictObject({
  kind: v.literal("recipe_ingredient"),
  id: v.number(),
  ingredient: IngredientSchema,
  quantities: v.array(QuantitySchema),
});

export const RecipesBaseSchema = v.strictObject({
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
  url: v.string(),
  ...RecipesBaseSchema.entries,
});

export const RecipeSchema = v.variant("source", [BookSchema, WebsiteSchema]);

export type Recipe = v.InferOutput<typeof RecipeSchema>;

export const RecipesSchema = v.strictObject({
  recipes: v.array(RecipeSchema),
});

export type QuantifiedIngredient = {
  ingredient: Ingredient;
  quantity: Quantity[];
};

type DistributiveOmit<T, K extends keyof T> = T extends any
  ? Omit<T, K>
  : never;

export type UnstoredRecipe = DistributiveOmit<Recipe, "id" | "ingredients"> & {
  ingredients: QuantifiedIngredient[];
};

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
