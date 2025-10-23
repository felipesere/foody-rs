import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";

export const StorageSchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
});
export type Storage = z.infer<typeof StorageSchema>;

const StoragesSchema = z.object({
  storage: z.array(StorageSchema),
});

export function useAllStorages(token: string) {
  return useQuery({
    queryKey: ["storages"],
    queryFn: async () => {
      const body = await http
        .get("api/storages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return StoragesSchema.parse(body).storage;
    },
  });
}
