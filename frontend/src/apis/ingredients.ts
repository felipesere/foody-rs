import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";
import type { Quantity } from "./recipes.ts";
import type { Shoppinglist } from "./shoppinglists.ts";

export const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.string()),
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
  tags: Array<string>;
};

export function useSetIngredientTags(
  token: string,
  ingredient: Ingredient["id"],
  invalidate?: {
    shoppinglistId: Shoppinglist["id"];
  },
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ tags }: SetTagsParams) => {
      const response = await http
        .post(`api/ingredients/${ingredient}/tags`, {
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
