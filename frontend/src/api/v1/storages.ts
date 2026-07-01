import * as v from "valibot";
import { useQuery } from "@tanstack/react-query";
import { authed, useApiMutation } from "./index.ts";

export const StorageSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export type Storage = v.InferOutput<typeof StorageSchema>;

export const StoragesSchema = v.strictObject({
  storages: v.array(StorageSchema),
});

export function useStorages(token: string) {
  return useQuery({
    queryKey: ["storages"],
    queryFn: async () =>
      v.parse(StoragesSchema, await authed(token).get("api/v1/storages").json()),
  });
}

export function useCreateStorage(token: string) {
  return useApiMutation({
    mutationFn: (vars: { name: string }) =>
      authed(token).post("api/v1/storages", { json: { aisle: vars } }),
    invalidates: ["storages"],
  });
}
