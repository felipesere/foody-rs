import * as v from "valibot";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./index.ts";

export const StorageSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export type Storage = v.InferOutput<typeof StorageSchema>;

export const StoragesSchema = v.strictObject({
  storages: v.array(StorageSchema),
});

export const client = function () {
  return {
    index: (token: string) => {
      return useQuery({
        queryKey: ["storages"],
        queryFn: async () => {
          const body = await http
            .get("api/v1/storages", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .json();

          return v.parse(StoragesSchema, body);
        },
      });
    },
    create: (token: string) => {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: async (params: { name: string }) => {
          await http.post(`api/v1/storages`, {
            json: {
              aisle: params,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["storages"] });
        },
      });
    },
  };
};
