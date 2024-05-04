import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { http } from "./http.ts";
import { type StoredQuantity, StoredQuantitySchema } from "./recipes.ts";

const MinimalShoppinglistSchema = z.object({
  id: z.number(),
  name: z.string(),
  last_updated: z.string().datetime().pipe(z.coerce.date()),
});
const AllShoppinglistsSchema = z.object({
  shoppinglists: z.array(MinimalShoppinglistSchema),
});

export function useAllShoppinglists(token: string) {
  return useQuery({
    queryKey: ["shoppinglists"],
    queryFn: async () => {
      const body = await http
        .get("api/shoppinglists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return AllShoppinglistsSchema.parse(body);
    },
  });
}

const ItemQuantitySchema = StoredQuantitySchema.extend({
  in_basket: z.boolean(),
  recipe_id: z.nullable(z.number()),
});
const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  quantities: z.array(ItemQuantitySchema),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

const ShoppinglistSchema = z.object({
  id: z.number(),
  name: z.string(),
  last_updated: z.string().datetime(),
  ingredients: z.array(IngredientSchema),
});

export type Shoppinglist = z.infer<typeof ShoppinglistSchema>;

export function useShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
) {
  return useQuery({
    queryKey: ["shoppinglist", shoppinglistId],
    refetchInterval: 2000, // ms
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const body = await http
        .get(`api/shoppinglists/${shoppinglistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return ShoppinglistSchema.parse(body);
    },
  });
}

type CreateShoppinglist = {
  name: string;
};

export function useCreateShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateShoppinglist) => {
      await http
        .post("api/shoppinglists", {
          json: {
            name: params.name,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSuccess: (_opts, params, _ctx) => {
      toast.success(`Created a new shoppinglist ${params.name}`);
      return client.invalidateQueries({ queryKey: ["shoppinglists"] });
    },
    onError: (err, params) => {
      console.log(
        `Failed to create shoppinglist: ${JSON.stringify(err, null, 2)}`,
      );
      toast.error(`Failed to create shoppinglist ${params.name}`);
    },
  });
}

type ToggleIngredientParams = {
  ingredientId: Ingredient["id"];
  inBasket: boolean;
};

export function useToggleIngredientInShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (params: ToggleIngredientParams) => {
      await http
        .post(
          `api/shoppinglists/${shoppinglistId}/ingredient/${params.ingredientId}/in_basket`,
          {
            json: {
              in_basket: params.inBasket,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .json();
    },
    onMutate: async (params) => {
      await client.cancelQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });

      const previousShoppinglist = client.getQueryData<Shoppinglist>([
        "shoppinglist",
        shoppinglistId,
      ]);

      if (previousShoppinglist) {
        const updatedList = updateItemInShoppingList(
          previousShoppinglist,
          params.ingredientId,
          (ingredient) => {
            return {
              ...ingredient,
              quantities: ingredient.quantities.map((q) => {
                return { ...q, in_basket: params.inBasket };
              }),
            };
          },
        );
        console.log(
          `Setting query data for ${shoppinglistId} and ${params.ingredientId} to be in_basket:${params.inBasket}`,
        );
        client.setQueryData(["shoppinglist", shoppinglistId], updatedList);
      }
      return { previousShoppinglist };
    },
    onError: (_err, _params, context) => {
      client.setQueryData(
        ["shoppinglist", shoppinglistId],
        context?.previousShoppinglist,
      );
    },
    onSettled: async () => {
      // If we have mutations "bottled up" because we've been offline for a bit,
      // then only invalidate the 'shoppinglists' on the last mutation...
      if (client.isMutating() === 1) {
        console.log("Invalidating after last mutation...");
        await client.invalidateQueries({
          queryKey: ["shoppinglist", shoppinglistId],
        });
      }
    },
    onSuccess: () => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
  });
}

function updateItemInShoppingList(
  shoppinglist: Shoppinglist,
  ingredientId: number,
  f: (i: Ingredient) => Ingredient,
) {
  return {
    ...shoppinglist,
    ingredients: shoppinglist.ingredients.map((ingredient) => {
      return ingredient.id !== ingredientId ? ingredient : f(ingredient);
    }),
  };
}

type DeleteIngredientParams = {
  ingredient: string;
};
export function useRemoveIngredientFromShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: DeleteIngredientParams) => {
      await http
        .delete(`api/shoppinglists/${shoppinglistId}/ingredient`, {
          json: {
            ingredient: params.ingredient,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: () => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
    onError: (err, params) => {
      console.log(
        `Failed to remove ingredient from shoppinglsit: ${JSON.stringify(
          err,
          null,
          2,
        )}`,
      );
      toast.error(`Failed to remove ${params.ingredient} from shoppinglist`);
    },
  });
}

type DeleteShoppinglistParams = {
  id: Shoppinglist["id"];
};
export function useRemoveShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: DeleteShoppinglistParams) => {
      await http
        .delete(`api/shoppinglists/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: (_data, _error, params) => {
      client.invalidateQueries({
        queryKey: ["shoppinglists"],
      });
      return client.invalidateQueries({
        queryKey: ["shoppinglist", params.id],
      });
    },
    onError: (err, params) => {
      console.log(
        `Failed to remove shoppinglist : ${JSON.stringify(err, null, 2)}`,
      );
      toast.error(`Failed to remove shoppinglist ${params.id}`);
    },
    onSuccess: (_data, params) => {
      toast.success(`Removed shoppinglist ${params.id}`);
    },
  });
}

type RemoveQuantityParams = { id: StoredQuantity["id"] };
export function useRemoveQuantityFromShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: RemoveQuantityParams) => {
      await http
        .delete(`api/shoppinglists/${shoppinglistId}/quantity/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: () => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
    onError: (err, _) => {
      console.log(
        `Failed to remove quantity from shoppinglist ${shoppinglistId}: ${JSON.stringify(
          err,
          null,
          2,
        )}`,
      );
      toast.error("Failed to remove quantity from shoppinglist");
    },
  });
}
type AddQuantityParams = { rawQuantity: string };
export function useAddQuantityToIngredientInShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
  ingredientId: Ingredient["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: AddQuantityParams) => {
      await http
        .post(
          `api/shoppinglists/${shoppinglistId}/ingredient/${ingredientId}/quantity`,
          {
            json: {
              quantity: params.rawQuantity,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .json();
    },
    onSettled: () => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
    onError: (err, _) => {
      console.log(
        `Failed to add quantity to shoppinglist ${shoppinglistId} and ingredient ${ingredientId}: ${JSON.stringify(
          err,
          null,
          2,
        )}`,
      );
      toast.error("Failed to add quantity to shoppinglist");
    },
  });
}

type UpdateQuantityParams = { id: StoredQuantity["id"]; rawQuantity: string };
export function useUpdateQuantityOnShoppinglist(
  token: string,
  shoppinglistId: Shoppinglist["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateQuantityParams) => {
      await http
        .post(`api/shoppinglists/${shoppinglistId}/quantity/${params.id}`, {
          json: {
            quantity: params.rawQuantity,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();
    },
    onSettled: () => {
      return client.invalidateQueries({
        queryKey: ["shoppinglist", shoppinglistId],
      });
    },
    onError: (err, params) => {
      console.log(
        `Failed to update quantity ${
          params.id
        } on shoppinglist ${shoppinglistId}: ${JSON.stringify(err, null, 2)}`,
      );
      toast.error("Failed to update quantity on shoppinglist");
    },
  });
}

type DeleteShoppinglistParams = {
  id: Shoppinglist["id"];
};
export function useDeleteShoppinglist(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: DeleteShoppinglistParams) => {
      return http.delete(`api/shoppinglists/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSettled: async (_res, _err, params) => {
      await client.invalidateQueries({
        queryKey: ["shoppinglists"],
      });
      return client.invalidateQueries({
        queryKey: ["shoppinglist", params.id],
      });
    },
    onError: (err, params) => {
      console.log(
        `Failed to delete shoppinglist ${params.id}: ${JSON.stringify(
          err,
          null,
          2,
        )}`,
      );
      toast.error(`Failed to delete shoppinglist ${params.id}`);
    },
  });
}
