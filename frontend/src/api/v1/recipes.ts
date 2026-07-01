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

// The source-discriminated fields, mirroring exactly what the backend
// serializes (every recipe carries title/page/url, with nulls for the fields
// that don't apply to its source). RecipeSchema and SourceSchema are both built
// from these so the two can never drift apart.
const BookSourceSchema = v.strictObject({
  source: v.literal("book"),
  title: v.string(),
  page: v.number(),
  url: v.null(),
});

const WebsiteSourceSchema = v.strictObject({
  source: v.literal("website"),
  title: v.null(),
  page: v.null(),
  url: v.string(),
});

export const SourceSchema = v.variant("source", [
  BookSourceSchema,
  WebsiteSourceSchema,
]);

export type SourceDetails = v.InferOutput<typeof SourceSchema>;

const BookSchema = v.object({
  ...BookSourceSchema.entries,
  ...RecipesBaseSchema.entries,
});

const WebsiteSchema = v.object({
  ...WebsiteSourceSchema.entries,
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
      rating?: number;
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
