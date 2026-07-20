import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as v from "valibot";
import { humanize } from "../../quantities.ts";
import { http, useApiMutation } from "./index.ts";
import { TagsSchema } from "./ingredient.ts";
import { IngredientSchema, QuantitySchema } from "./shoppinglists.ts";

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

// An ingredient + its quantities within a recipe that hasn't been stored yet:
// a RecipeIngredient without the stored-only join fields.
export type QuantifiedIngredient = Omit<RecipeIngredient, "id" | "kind">;

type DistributiveOmit<T, K extends keyof T> = T extends any
  ? Omit<T, K>
  : never;

export type UnstoredRecipe = DistributiveOmit<Recipe, "id" | "ingredients"> & {
  ingredients: QuantifiedIngredient[];
};

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () =>
      v.parse(RecipesSchema, await http.get("api/v1/recipes").json()),
  });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () =>
      v.parse(RecipeSchema, await http.get(`api/v1/recipes/${id}`).json()),
  });
}

export function useRecipeTags() {
  return useQuery({
    queryKey: ["recipes_tags"],
    queryFn: async () =>
      v.parse(TagsSchema, await http.get("api/v1/recipes/tags").json()),
  });
}

export function useCreateRecipe(navigate: (id: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: UnstoredRecipe) => {
      const recipe = {
        name: vars.name,
        tags: vars.tags,
        rating: vars.rating,
        notes: vars.notes,
        duration: vars.duration,
        ...sourcePayload(
          vars.source === "book"
            ? { source: "book", title: vars.title, page: vars.page }
            : { source: "website", url: vars.url },
        ),
      };
      // Rails parses each quantity from a string (e.g. "500g"), so re-render
      // the parsed Quantity back into that form.
      const ingredients = vars.ingredients.map((qi) => ({
        ingredient_id: qi.ingredient.id,
        quantity: humanize(qi.quantities[0]),
      }));
      return v.parse(
        RecipeSchema,
        await http
          .post("api/v1/recipes", { json: { recipe, ingredients } })
          .json(),
      );
    },
    onSuccess: async (data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.setQueryData(["recipe", data.id], data);
      toast(`Created "${vars.name}"`);
      navigate(data.id);
    },
  });
}

/**
 * The source-discriminated portion of a recipe as callers express it (`title` /
 * `page` / `url`). Rails names these columns differently, so all writes funnel
 * through `sourcePayload` for one consistent translation.
 */
export type SourceInput =
  | { source: "book"; title: string; page: number }
  | { source: "website"; url: string };

// Rails' recipes#create/#update read `params.require(:recipe)` and name the
// source columns book_title / book_page / website_url.
function sourcePayload(source: SourceInput) {
  return source.source === "book"
    ? {
        source: "book",
        book_title: source.title,
        book_page: source.page,
        website_url: null,
      }
    : {
        source: "website",
        website_url: source.url,
        book_title: null,
        book_page: null,
      };
}

export type RecipeUpdate = {
  recipeId: number;
  name?: string;
  notes?: string;
  tags?: string[];
  rating?: number;
  duration?: string;
  source?: SourceInput;
};

export function useUpdateRecipe() {
  return useApiMutation({
    mutationFn: async (vars: RecipeUpdate) => {
      const { recipeId, source, ...rest } = vars;
      const recipe = { ...rest, ...(source ? sourcePayload(source) : {}) };
      return v.parse(
        RecipeSchema,
        await http
          .put(`api/v1/recipes/${recipeId}`, { json: { recipe } })
          .json(),
      );
    },
    invalidates: (vars) => [["recipe", vars.recipeId], ["recipes"]],
    onSuccess: (data) => {
      toast(`Updated "${data.name}"`);
    },
  });
}

export function useDeleteRecipe() {
  return useApiMutation({
    mutationFn: (recipeId: number) => http.delete(`api/v1/recipes/${recipeId}`),
    invalidates: (recipeId) => [["recipe", recipeId], ["recipes"]],
    onSuccess: (_data, recipeId) => {
      toast(`Deleted "${recipeId}"`);
    },
  });
}

export function useAddRecipeIngredient() {
  return useApiMutation({
    mutationFn: (vars: {
      recipeId: number;
      ingredient_id: number;
      quantity: string;
    }) =>
      http.post(`api/v1/recipes/${vars.recipeId}/ingredients`, {
        json: { ingredient_id: vars.ingredient_id, quantity: vars.quantity },
      }),
    invalidates: (vars) => [["recipe", vars.recipeId], ["recipes"]],
  });
}

export function useRemoveRecipeIngredient() {
  return useApiMutation({
    mutationFn: (vars: { recipeId: number; ingredientId: number }) =>
      http.delete(
        `api/v1/recipes/${vars.recipeId}/ingredients/${vars.ingredientId}`,
      ),
    invalidates: (vars) => [["recipe", vars.recipeId], ["recipes"]],
  });
}
