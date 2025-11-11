import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";
import type { Quantity } from "./recipes.ts";
import type { Shoppinglist } from "./shoppinglists.ts";
import { StorageSchema } from "./storage.ts";

const AisleSchema = z.object({
  name: z.string(),
  order: z.number(),
});
export type Aisle = z.infer<typeof AisleSchema>;

export const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.string()),
  aisle: z.nullable(AisleSchema),
  stored_in: z.nullable(StorageSchema),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
const IngredientsSchema = z.array(IngredientSchema);

type AddIngredientParams = {
  ingredient: Ingredient["name"];
  shoppinglistId: Shoppinglist["id"];
  quantity: Quantity[];
};

export function addIngredientToShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shoppinglistId,
      ingredient,
      quantity,
    }: AddIngredientParams) => {
      await http.post(`api/shoppinglists/${shoppinglistId}/ingredient`, {
        json: {
          ingredient,
          quantity,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSettled: (_data, _err, { shoppinglistId }) => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
  });
}

export function useAllIngredients(token: string) {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const body = await http
        .get("api/ingredients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return IngredientsSchema.parse(body).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },
  });
}

type NewIngredient = {
  name: string;
  tags: Array<string>;
};
export function useCreateNewIngredient(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, tags }: NewIngredient) => {
      const response = await http
        .post("api/ingredients", {
          json: {
            name,
            tags,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return IngredientSchema.parse(response);
    },
    onSettled: (_data, _err, _) => {
      return client.invalidateQueries({
        queryKey: ["ingredients"],
      });
    },
  });
}

type EditIngredientParams = {
  id: Ingredient["id"];
  changes: IngredientChanges[];
};

type IngredientChanges =
  | { type: "name"; value: string }
  | { type: "tags"; value: string[] }
  | { type: "aisle"; value: string | null }
  | { type: "storedin"; value: number | null };

export function useEditIngredient(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, changes }: EditIngredientParams) => {
      const response = await http
        .post(`api/ingredients/${id}`, {
          json: {
            changes,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return IngredientSchema.parse(response);
    },
    onSettled: (_data, _err, _) => {
      return client.invalidateQueries({
        queryKey: ["ingredients"],
      });
    },
  });
}

const IngredientTagsSchema = z.object({
  tags: z.array(z.string()),
});

export function useAllIngredientTags(token: string) {
  return useQuery({
    queryKey: ["ingredients", "tags"],
    queryFn: async () => {
      const body = await http
        .get("api/ingredients/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      let ingredientTags = IngredientTagsSchema.parse(body);

      return ingredientTags.tags.sort();
    },
  });
}

type MergeIngredientParams = {
  replace: Ingredient["id"][];
  target: Ingredient["id"];
};

export function useMergeIngredients(token: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (params: MergeIngredientParams) =>
      http.post("api/ingredients/merge", {
        json: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: ["ingredients"] });
      await client.invalidateQueries({ queryKey: ["recipes"] });
      await client.invalidateQueries({ queryKey: ["recipe"] });
      await client.invalidateQueries({ queryKey: ["shoppinglist"] });
    },
  });
}
