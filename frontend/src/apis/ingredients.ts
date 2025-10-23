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

type SetTagsParams = {
  id?: Ingredient["id"];
  tags: Array<string>;
};

export function useSetIngredientTags(
  token: string,
  ingredient?: Ingredient["id"],
  invalidate?: {
    shoppinglistId: Shoppinglist["id"];
  },
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ tags, id }: SetTagsParams) => {
      if (!ingredient && !id) {
        return Promise.reject(
          "need to pass id either as param to hook or as variable",
        );
      }
      const ix = ingredient || id;
      const response = await http
        .post(`api/ingredients/${ix}/tags`, {
          json: {
            tags,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return IngredientSchema.parse(response);
    },
    onSettled: async () => {
      if (invalidate) {
        await client.invalidateQueries({
          queryKey: ["shoppinglist", invalidate.shoppinglistId],
        });
      }
      return client.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

type SetAisleParams = {
  aisle: string | null;
};

export function useSetIngredientAisle(
  token: string,
  ingredient: Ingredient["id"],
  invalidate?: {
    shoppinglistId: Shoppinglist["id"];
  },
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ aisle }: SetAisleParams) => {
      await http
        .post(`api/ingredients/${ingredient}/aisle`, {
          json: {
            aisle,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: async () => {
      if (invalidate) {
        await client.invalidateQueries({
          queryKey: ["shoppinglist", invalidate.shoppinglistId],
        });
      }
      return client.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

type SetStorageParams = {
  ingredient: Ingredient["id"];
  id?: Storage["id"];
};

export function useSetIngredientStorage(token: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ingredient }: SetStorageParams) => {
      await http
        .post(`api/ingredients/${ingredient}/storage`, {
          json: {
            id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: async () => {
      return client.invalidateQueries({ queryKey: ["ingredients"] });
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

      return IngredientTagsSchema.parse(body);
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
