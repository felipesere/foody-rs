import * as v from "valibot";
import { useQuery } from "@tanstack/react-query";
import { http, useApiMutation } from "./index.ts";

export const AisleSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export type Aisle = v.InferOutput<typeof AisleSchema>;

export const AislesSchema = v.strictObject({
  aisles: v.array(AisleSchema),
});

export function useAisles() {
  return useQuery({
    queryKey: ["aisles"],
    queryFn: async () =>
      v.parse(AislesSchema, await http.get("api/v1/aisles").json()),
  });
}

export function useCreateAisle() {
  return useApiMutation({
    mutationFn: (vars: { name: string }) =>
      http.post("api/v1/aisles", { json: { aisle: vars } }),
    invalidates: ["aisles"],
  });
}

export function useUpdateAisle() {
  return useApiMutation({
    mutationFn: (vars: { id: number; name: string; order: number }) =>
      http.put(`api/v1/aisles/${vars.id}`, {
        json: { aisle: { name: vars.name, order: vars.order } },
      }),
    invalidates: ["aisles"],
  });
}
