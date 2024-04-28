import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";
import type { Quantity } from "./recipes.ts";
import type { Shoppinglist } from "./shoppinglists.ts";

const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.object({})),
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

      return IngredientsSchema.parse(body);
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
