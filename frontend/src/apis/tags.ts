import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";

const TagSchema = z.object({
  name: z.string(),
  order: z
    .number()
    .nullable()
    .transform((x) => x ?? undefined),
  is_aisle: z.boolean(),
});

const TagsSchema = z.array(TagSchema);

export type Tags = z.infer<typeof TagsSchema>

export function useAllTags(token: string) {
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

      const tags = TagsSchema.parse(body);

      return tags.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }

        return a.order === null ? 1 : -1;
      });
    },
  });
}
