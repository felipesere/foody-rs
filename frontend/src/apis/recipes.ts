import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import type { SimplifiedRecipe } from "../components/editRecipeFrom.tsx";
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

const BookSourceSchema = z.object({
  source: z.literal("book"),
  title: z.string(),
  page: z.number(),
});

const WebsiteSourceSchema = z.object({
  source: z.literal("website"),
  url: z.string(),
});

const SourceSchema = z.discriminatedUnion("source", [
  BookSourceSchema,
  WebsiteSourceSchema,
]);

export type Source = z.infer<typeof SourceSchema>;

const RecipeSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    ingredients: z.array(IngredientSchema),
    tags: z.array(z.string()),
  })
  .and(SourceSchema);

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
    mutationFn: async (variables: SimplifiedRecipe) => {
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
