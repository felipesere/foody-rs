import { useMutation, useQuery } from "@tanstack/react-query";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { http } from "./index.ts";

export const IngredientSchema = v.object({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: v.nullable(AisleSchema),
});

export type Ingredient = v.InferOutput<typeof IngredientSchema>;

const TagsSchema = v.object({
  tags: v.array(v.string()),
});

export const IngredientsSchema = v.object({
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
      return useMutation({
        mutationFn: async (params: {
          ingredient_id: number;
          fields: {
            tags?: string[];
            aisle_id?: number;
          };
        }) => {
          await http.put(`api/v1/ingredients/${params.ingredient_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            json: params.fields,
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
