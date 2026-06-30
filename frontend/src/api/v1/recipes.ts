import * as v from "valibot";
import { IngredientSchema, Quantity, QuantitySchema } from "./shoppinglists.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./index.ts";
import type { Ingredient } from "../../apis/ingredients.ts";
import { toast } from "sonner";
import { TagsSchema } from "./ingredient.ts";

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
  create: (token: string, navigate: (id: number) => void) => {
    const client = useQueryClient();
    return useMutation({
      mutationFn: async (params: UnstoredRecipe) => {
        const body = await http
          .post("api/v1/recipes", {
            method: "POST",
            json: params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .json();
        return v.parse(RecipeSchema, body);
      },
      onSuccess: async (data, vars) => {
        await client.invalidateQueries({ queryKey: ["recipes"] });
        client.setQueryData(["recipe", data.id], data);
        toast(`Created "${vars.name}"`);
        navigate(data.id);
      },
    });
  },
  recipe: (recipeId: number) => {
    return {
      update: (token: string) => {
        return useMutation({
          mutationFn: async (params: {
            name?: string;
            notes?: string;
            tags?: string[];
          }) => {
            const body = await http
              .put(`api/v1/recipes/${recipeId}`, {
                method: "POST",
                json: params,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .json();
            return v.parse(RecipeSchema, body);
          },
          onSuccess: async (data, _) => {
            toast(`Updated "${data.name}"`);
          },
        });
      },
      ingredients: () => {
        return {};
      },
    };
  },
  tags: (token: string) => {
    return useQuery({
      queryKey: ["recipes"],
      queryFn: async () => {
        const body = await http
          .get("api/v1/recipes/tags", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .json();

        return v.parse(TagsSchema, body);
      },
    });
  },
};
