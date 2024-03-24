import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const MinimalShoppinglistSchema = z.object({
  id: z.number(),
  name: z.string(),
  last_updated: z.string().datetime(),
});
const AllShoppinglistsSchema = z.object({
  shoppinglists: z.array(MinimalShoppinglistSchema),
});

export function useAllShoppinglists(token: string) {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/shoppinglists", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await response.json();
      return AllShoppinglistsSchema.parse(body);
    },
  });
}
