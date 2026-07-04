import * as v from "valibot";
import { useQuery } from "@tanstack/react-query";
import { authed, useApiMutation } from "./index.ts";

export const AisleSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export type Aisle = v.InferOutput<typeof AisleSchema>;

export const AislesSchema = v.strictObject({
  aisles: v.array(AisleSchema),
});

export function useAisles(token: string) {
  return useQuery({
    queryKey: ["aisles"],
    queryFn: async () =>
      v.parse(AislesSchema, await authed(token).get("api/v1/aisles").json()),
  });
}

export function useCreateAisle(token: string) {
  return useApiMutation({
    mutationFn: (vars: { name: string }) =>
      authed(token).post("api/v1/aisles", { json: { aisle: vars } }),
    invalidates: ["aisles"],
  });
}

export function useUpdateAisle(token: string) {
  return useApiMutation({
    mutationFn: (vars: { id: number; name: string; order: number }) =>
      authed(token).put(`api/v1/aisles/${vars.id}`, {
        json: { aisle: { name: vars.name, order: vars.order } },
      }),
    invalidates: ["aisles"],
  });
}
