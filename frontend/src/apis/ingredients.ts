import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
  quantity: Omit<Quantity, "id">[];
};

export function addIngredientToShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      shoppinglistId,
      ingredient,
      quantity,
    }: AddIngredientParams) => {
      await fetch(
        `http://localhost:3000/api/shoppinglists/${shoppinglistId}/ingredient`,
        {
          body: JSON.stringify({
            ingredient,
            quantity,
          }),
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

export function useAllIngredients(token: string) {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/ingredients", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await response.json();
      return IngredientsSchema.parse(body);
    },
  });
}
