import { useQuery } from "@tanstack/react-query";
import * as v from "valibot";
import { http, useApiMutation } from "./index.ts";

export const StorageSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export type Storage = v.InferOutput<typeof StorageSchema>;

export const StoragesSchema = v.strictObject({
  storages: v.array(StorageSchema),
});

export function useStorages() {
  return useQuery({
    queryKey: ["storages"],
    queryFn: async () =>
      v.parse(StoragesSchema, await http.get("api/v1/storages").json()),
  });
}

export function useCreateStorage() {
  return useApiMutation({
    mutationFn: (vars: { name: string }) =>
      http.post("api/v1/storages", { json: { aisle: vars } }),
    invalidates: ["storages"],
  });
}
