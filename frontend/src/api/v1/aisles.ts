import * as v from "valibot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./index.ts";

export const AisleSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export const AislesSchema = v.strictObject({
  aisles: v.array(AisleSchema),
});

export const client = function () {
  return {
    index: (token: string) => {
      return useQuery({
        queryKey: ["aisles"],
        queryFn: async () => {
          const body = await http
            .get("api/v1/aisles", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .json();

          return v.parse(AislesSchema, body);
        },
      });
    },
    create: (token: string) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (params: { name: string }) => {
          await http.post(`api/v1/aisles`, {
            json: {
              aisle: params,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["mealplans"] });
        },
      });
    },
  };
};
