import { useQuery } from "@tanstack/react-query";
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

      const tags = AislesSchema.parse(body);
      return tags.aisles;
    },
  });
}
