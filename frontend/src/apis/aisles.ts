import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";

const AisleSchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
});
export type Aisle = z.infer<typeof AisleSchema>;

const AislesSchema = z.object({
  aisles: z.array(AisleSchema),
});

export function useAllAisles(token: string) {
  return useQuery({
    queryKey: ["aisles"],
    queryFn: async () => {
      const body = await http
        .get("api/aisles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return AislesSchema.parse(body).aisles;
    },
  });
}

export function useCreateAisle(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["aisles/new"],
    mutationFn: async ({ name }: { name: string }) => {
      const response = await http
        .post("api/aisles", {
          json: {
            name,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return AisleSchema.parse(response);
    },
    onSettled: (_data, _err, _) => {
      return client.invalidateQueries({
        queryKey: ["aisles"],
      });
    },
  });
}
