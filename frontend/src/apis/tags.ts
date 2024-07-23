import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";

const IsleTagSchema = z.object({
  is_aisle: z.literal(true),
  order: z.number(),
});

const BoringTagSchema = z.object({
  is_aisle: z.literal(false),
});

const IsleOrBoring = z.discriminatedUnion("is_aisle", [
  IsleTagSchema,
  BoringTagSchema,
]);

const TagSchema = z
  .object({
    name: z.string(),
  })
  .and(IsleOrBoring);

const TagsSchema = z.array(TagSchema);

export type Tag = z.infer<typeof TagSchema>;
export type Tags = Record<string, Tag>;

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

      const ts: Record<string, Tag> = {};
      for (const tag of tags) {
        ts[tag.name] = tag;
      }

      return ts;
    },
  });
}

type CreateTagParams = {
  name: string;
};

export function useCreateTag(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (variables: CreateTagParams) => {
      return http.post("api/tags", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: variables,
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
