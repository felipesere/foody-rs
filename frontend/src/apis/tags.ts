import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";

const TagSchema = z.object({
  name: z.string(),
  order: z.number().nullable(),
  is_aisle: z.boolean(),
});

const TagsSchema = z.array(TagSchema);

export function useTags(token: string) {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const body = await http
        .get("api/tags", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return TagsSchema.parse(body);
    },
  });
}
