import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
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

const RecipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  ingredients: z.array(IngredientSchema),
  tags: z.array(z.string()),
  rating: z.number(),
  notes: z.string(),
  source: z.literal("website").or(z.literal("book")),
  title: z.string().nullable(),
  page: z.number().nullable(),
  url: z.string().nullable(),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export type Source = Pick<Recipe, "source" | "title" | "page" | "url">;

export type Ingredient = z.infer<typeof IngredientSchema>;

export type UnstoredIngredient = Omit<Ingredient, "id" | "quantity"> & {
  quantity: Quantity[];
};
export type UnstoredRecipe = Omit<Recipe, "id" | "ingredients"> & {
  ingredients: UnstoredIngredient[];
};

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

export function useRecipeOptions(token: string, id: Recipe["id"]) {
  return queryOptions({
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

export function useRecipe(token: string, id: Recipe["id"]) {
  return useQuery(useRecipeOptions(token, id));
}

export type EditRecipeFormParams = Omit<Recipe, "ingredients" | "id"> & {
  id?: Recipe["id"];
  ingredients: { quantity: string; id: Ingredient["id"] }[];
};

export function useUpdateRecipe(token: string, recipeId: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: EditRecipeFormParams) => {
      const body = await http
        .post(`api/recipes/${recipeId}`, {
          method: "POST",
          json: variables,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return RecipeSchema.parse(body);
    },
    onSuccess: async (_, vars) => {
      await client.invalidateQueries({ queryKey: ["recipe", recipeId] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      toast(`Updated "${vars.name}"`);
    },
  });
}

export function useCreateRecipe(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: UnstoredRecipe) => {
      await http
        .post("api/recipes", {
          method: "POST",
          json: variables,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSuccess: async (_, vars) => {
      await client.invalidateQueries({ queryKey: ["recipes"] });
      toast(`Created "${vars.name}"`);
    },
  });
}

export function useDeleteRecipe(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (recipeId: Recipe["id"]) => {
      await http.delete(`api/recipes/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: async (_, vars) => {
      await client.invalidateQueries({ queryKey: ["recipe", vars] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      toast(`Deleted "${vars}"`);
    },
  });
}

const RecipeTagsSchema = z.object({
  tags: z.array(z.string()),
});

export function useRecipeTags(token: string) {
  return useQuery({
    queryKey: ["recipes", "tags"],
    queryFn: async () => {
      const body = await http
        .get("api/recipes/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return RecipeTagsSchema.parse(body);
    },
  });
}

export function useSetRecipeRating(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (rating: number) => {
      return http.post(`api/recipes/${id}/rating/${rating}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useSetRecipeTags(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (tags: Recipe["tags"]) => {
      await http.put(`api/recipes/${id}/tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          tags,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      await client.invalidateQueries({ queryKey: ["recipes", "tags"] });
    },
  });
}
export function useSetRecipeNotes(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (notes: Recipe["notes"]) => {
      await http.post(`api/recipes/${id}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          notes,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      toast.info("Saved notes.");
    },
  });
}
export function useAddIngredient(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { ingredient: number; quantity: string }) => {
      await http.post(`api/recipes/${id}/ingredients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          ingredient: vars.ingredient,
          quantity: vars.quantity,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useDeleteIngredient(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { ingredient: number }) => {
      await http.delete(`api/recipes/${id}/ingredients/${vars.ingredient}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useSetRecipeName(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (name: Recipe["name"]) => {
      await http.put(`api/recipes/${id}/name`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          name,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useSetRecipeSource(token: string, id: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (source: Source) => {
      await http.put(`api/recipes/${id}/source`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: source,
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
