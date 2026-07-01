import * as v from "valibot";
import { IngredientSchema, Quantity, QuantitySchema } from "./shoppinglists.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authed, useApiMutation } from "./index.ts";
import type { Ingredient } from "../../apis/ingredients.ts";
import { toast } from "sonner";
import { TagsSchema } from "./ingredient.ts";

const RecipeIngredientSchema = v.strictObject({
  kind: v.literal("recipe_ingredient"),
  id: v.number(),
  ingredient: IngredientSchema,
  quantities: v.array(QuantitySchema),
});

export type RecipeIngredient = v.InferOutput<typeof RecipeIngredientSchema>;

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

export type Source =
  | { source: "book"; title: string; page: number; url: null }
  | { source: "website"; title: null; page: null; url: string };

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

export function useRecipes(token: string) {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () =>
      v.parse(RecipesSchema, await authed(token).get("api/v1/recipes").json()),
  });
}

export function useRecipeTags(token: string) {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () =>
      v.parse(
        TagsSchema,
        await authed(token).get("api/v1/recipes/tags").json(),
      ),
  });
}

export function useCreateRecipe(token: string, navigate: (id: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: UnstoredRecipe) =>
      v.parse(
        RecipeSchema,
        await authed(token).post("api/v1/recipes", { json: vars }).json(),
      ),
    onSuccess: async (data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.setQueryData(["recipe", data.id], data);
      toast(`Created "${vars.name}"`);
      navigate(data.id);
    },
  });
}

export function useUpdateRecipe(token: string) {
  return useApiMutation({
    mutationFn: async (vars: {
      recipeId: number;
      name?: string;
      notes?: string;
      tags?: string[];
    }) => {
      const { recipeId, ...fields } = vars;
      return v.parse(
        RecipeSchema,
        await authed(token)
          .put(`api/v1/recipes/${recipeId}`, { json: fields })
          .json(),
      );
    },
    onSuccess: (data) => {
      toast(`Updated "${data.name}"`);
    },
  });
}
