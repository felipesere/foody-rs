import { useQuery } from "@tanstack/react-query";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { authed, useApiMutation } from "./index.ts";
import { StorageSchema } from "./storages.ts";

export const IngredientSchema = v.strictObject({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: v.nullable(AisleSchema),
  storage: v.nullable(StorageSchema),
});

export type Ingredient = v.InferOutput<typeof IngredientSchema>;

export const TagsSchema = v.strictObject({
  tags: v.array(v.string()),
});

export const IngredientsSchema = v.strictObject({
  ingredients: v.array(IngredientSchema),
});

export function useIngredients(token: string) {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () =>
      v.parse(
        IngredientsSchema,
        await authed(token).get("api/v1/ingredients").json(),
      ),
  });
}

export function useIngredientTags(token: string) {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () =>
      v.parse(
        TagsSchema,
        await authed(token).get("api/v1/ingredients/tags").json(),
      ),
  });
}

export function useUpdateIngredient(token: string) {
  return useApiMutation({
    mutationFn: (vars: {
      ingredient_id: number;
      fields: {
        tags?: string[];
        aisle_id?: number;
        storage_id?: number | null;
      };
    }) =>
      authed(token).put(`api/v1/ingredients/${vars.ingredient_id}`, {
        json: vars.fields,
      }),
    invalidates: ["ingredients"],
  });
}
