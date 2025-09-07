import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { http } from "./http.ts";
import { type Ingredient, IngredientSchema } from "./ingredients.ts";
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

const IngredientWithQuantitySchema = z.object({
  ingredient: IngredientSchema,
  quantity: z.array(StoredQuantitySchema),
});

const RecipeSchema = z.object({
  id: z.number(),
  name: z.string(),
  ingredients: z.array(IngredientWithQuantitySchema),
  tags: z.array(z.string()),
  rating: z.number(),
  notes: z.string(),
  source: z.literal("website").or(z.literal("book")),
  title: z.string().nullable(), // <-- TODO: this should be undefined!
  page: z.number().nullable(), // <-- TODO: this should be undefined!
  url: z.string().nullable(), // <-- TODO: this should be undefined!
  duration: z.string().nullable(),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export type Source = Pick<Recipe, "source" | "title" | "page" | "url">;

export type IngredientWithQuantity = z.infer<
  typeof IngredientWithQuantitySchema
>;

// TODO! this needs to be very different!
export type UnstoredIngredient = {
  ingredient: {
    id: number;
    name: string;
  };
  quantity: Quantity[];
};

export type QuantifiedIngredient = {
  ingredient: Ingredient;
  quantity: Quantity[];
};
export type UnstoredRecipe = Omit<Recipe, "id" | "ingredients"> & {
  ingredients: QuantifiedIngredient[];
};

export const RecipesSchema = z.object({
  recipes: z.array(RecipeSchema),
});

export type Change =
  | { type: "name"; value: string }
  | { type: "tags"; value: string[] }
  | { type: "notes"; value: string }
  | {
      type: "source";
      value:
        | { type: "book"; title: string; page: number }
        | { type: "website"; url: string };
    }
  | { type: "rating"; value: number }
  | { type: "duration"; value: string }
  | {
      type: "ingredients";
      value:
        | { type: "add"; id: number; quantity: string }
        | { type: "remove"; ingredient: number }
        | { type: "set"; ingredients: { id: number; quantity: string }[] };
    };

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

      let data = RecipesSchema.parse(body);

      data.recipes.sort((a, b) =>
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
      );

      return data;
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

export function useCreateRecipe(token: string, navigate: (id: number) => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: UnstoredRecipe) => {
      const body = await http
        .post("api/recipes", {
          method: "POST",
          json: variables,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
      return RecipeSchema.parse(body);
    },
    onSuccess: async (data, vars) => {
      await client.invalidateQueries({ queryKey: ["recipes"] });
      client.setQueryData(["recipe", data.id], data);
      toast(`Created "${vars.name}"`);
      navigate(data.id);
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

export function useChangeRecipe(token: string, id?: Recipe["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      changes: Change[];
      recipeId?: Recipe["id"];
    }) => {
      if (!id && !vars.changes) {
        throw new Error("Recipe id not set on call to useChangeRecipe");
      }
      const i = id || vars.recipeId;
      await http.post(`api/recipes/${i}/edit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: {
          changes: vars.changes,
        },
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["recipe", id] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      await client.invalidateQueries({ queryKey: ["recipes", "tags"] });
      toast(`Updated "${id}"`);
    },
  });
}
