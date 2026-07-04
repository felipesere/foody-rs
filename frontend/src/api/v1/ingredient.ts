import { useQuery } from "@tanstack/react-query";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { http, useApiMutation } from "./index.ts";
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

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () =>
      v.parse(
        IngredientsSchema,
        await http.get("api/v1/ingredients").json(),
      ),
  });
}

export function useIngredientTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () =>
      v.parse(
        TagsSchema,
        await http.get("api/v1/ingredients/tags").json(),
      ),
  });
}

export function useCreateIngredient() {
  return useApiMutation({
    mutationFn: async (vars: { name: string; tags: string[] }) =>
      v.parse(
        IngredientSchema,
        await http.post("api/v1/ingredients", { json: vars }).json(),
      ),
    invalidates: ["ingredients"],
  });
}

export function useUpdateIngredient() {
  return useApiMutation({
    mutationFn: (vars: {
      ingredient_id: number;
      fields: {
        tags?: string[];
        aisle_id?: number;
        storage_id?: number | null;
      };
    }) =>
      http.put(`api/v1/ingredients/${vars.ingredient_id}`, {
        json: vars.fields,
      }),
    invalidates: ["ingredients"],
  });
}

export function useMergeIngredients() {
  return useApiMutation({
    // `replace` are folded into `target`, which survives. The backend repoints
    // every reference and deletes the sources, so recipes and shopping lists
    // that mentioned a merged-away ingredient need re-fetching too.
    mutationFn: async (vars: {
      target: Ingredient["id"];
      replace: Ingredient["id"][];
    }) =>
      v.parse(
        IngredientSchema,
        await http
          .post(`api/v1/ingredients/${vars.target}/merge`, {
            json: { source_ids: vars.replace },
          })
          .json(),
      ),
    invalidates: () => [
      ["ingredients"],
      ["recipes"],
      ["recipe"],
      ["shoppinglist"],
    ],
  });
}
