import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  tags: z.array(z.object({})),
});
export type Ingredient = z.infer<typeof IngredientSchema>;
const IngredientsSchema = z.array(IngredientSchema);

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
