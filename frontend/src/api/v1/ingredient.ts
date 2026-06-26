import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { http } from "./index.ts";
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

const TagsSchema = v.strictObject({
  tags: v.array(v.string()),
});

export const IngredientsSchema = v.strictObject({
  ingredients: v.array(IngredientSchema),
});

export const client = function () {
  return {
    tags: function (token: string) {
      return useQuery({
        queryKey: ["tags"],
        queryFn: async () => {
          const body = await http
            .get(`api/v1/ingredients/tags`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .json();

          return v.parse(TagsSchema, body);
        },
      });
    },
    update: function (token: string) {
      let queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (params: {
          ingredient_id: number;
          fields: {
            tags?: string[];
            aisle_id?: number;
            storage_id?: number | null;
          };
        }) => {
          await http.put(`api/v1/ingredients/${params.ingredient_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: params.fields,
          });
        },
        onSettled: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["ingredients"],
          });
        },
      });
    },
    index: function (token: string) {
      return useQuery({
        queryKey: ["ingredients"],
        queryFn: async () => {
          const body = await http
            .get(`api/v1/ingredients`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .json();

          return v.parse(IngredientsSchema, body);
        },
      });
    },
  };
};
