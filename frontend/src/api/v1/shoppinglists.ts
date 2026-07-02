import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { authed, TimestampSchema, useApiMutation } from "./index.ts";
import { StorageSchema } from "./storages.ts";

export const QuantitySchema = v.strictObject({
  unit: v.string(),
  value: v.nullable(v.number()),
  text: v.nullable(v.string()),
});

export const StoredQuantitySchema = v.strictObject({
  id: v.number(),
  recipe_id: v.nullable(v.number()),
  ...QuantitySchema.entries,
});

export type Quantity = v.InferOutput<typeof QuantitySchema>;
export type StoredQuantity = v.InferOutput<typeof StoredQuantitySchema>;

export const IngredientSchema = v.strictObject({
  id: v.number(),
  kind: v.literal("ingredient"),
  name: v.string(),
  tags: v.array(v.string()),
  aisle: v.nullable(AisleSchema),
  storage: v.nullable(StorageSchema),
});

export const ShoppinglistItemSchema = v.strictObject({
  kind: v.literal("shoppinglist_item"),
  id: v.number(),
  note: v.nullable(v.string()),
  in_basket: v.boolean(),
  ingredient: IngredientSchema,
  quantities: v.array(StoredQuantitySchema),
});

export type ShoppinglistItem = v.InferOutput<typeof ShoppinglistItemSchema>;

export const ShoppinglistSchema = v.strictObject({
  id: v.number(),
  name: v.string(),
  kind: v.literal("shoppinglist"),
  last_updated: TimestampSchema,
  ingredients: v.array(ShoppinglistItemSchema),
});

export type Shoppinglist = v.InferOutput<typeof ShoppinglistSchema>;

export const SmallShoppinglist = v.strictObject({
  kind: v.literal("shoppinglist"),
  id: v.number(),
  name: v.string(),
  last_updated: TimestampSchema,
});

export const ShoppinglistsSchema = v.strictObject({
  shoppinglists: v.array(SmallShoppinglist),
});

const listKey = (shoppinglistId: number) => ["shoppinglist", shoppinglistId];

export function useShoppinglists(token: string) {
  return useQuery({
    queryKey: ["shoppinglists"],
    queryFn: async () =>
      v.parse(
        ShoppinglistsSchema,
        await authed(token).get("api/v1/shoppinglists").json(),
      ),
  });
}

export function useCreateShoppinglist(token: string) {
  return useApiMutation({
    mutationFn: async (vars: { name: string }) =>
      v.parse(
        ShoppinglistSchema,
        await authed(token)
          .post("api/v1/shoppinglists", { json: { name: vars.name } })
          .json(),
      ),
    invalidates: ["shoppinglists"],
    onSuccess: (_data, vars) => {
      toast.success(`Created a new shoppinglist ${vars.name}`);
    },
  });
}

export function useRemoveShoppinglist(token: string) {
  return useApiMutation({
    mutationFn: (vars: { id: number }) =>
      authed(token).delete(`api/v1/shoppinglists/${vars.id}`),
    invalidates: (vars) => [["shoppinglists"], listKey(vars.id)],
    onSuccess: (_data, vars) => {
      toast.success(`Removed shoppinglist ${vars.id}`);
    },
  });
}

export function useShoppinglist(token: string, shoppinglistId: number) {
  return useQuery({
    queryKey: listKey(shoppinglistId),
    refetchInterval: 2000, // ms
    refetchIntervalInBackground: true,
    queryFn: async () =>
      v.parse(
        ShoppinglistSchema,
        await authed(token).get(`api/v1/shoppinglists/${shoppinglistId}`).json(),
      ),
  });
}

export function useAddRecipe(token: string) {
  return useApiMutation({
    mutationFn: (vars: { shoppinglistId: number; recipeId: number }) =>
      authed(token).post(
        `api/v1/shoppinglists/${vars.shoppinglistId}/recipes/${vars.recipeId}`,
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useRemoveRecipe(token: string) {
  return useApiMutation({
    mutationFn: (vars: { shoppinglistId: number; recipeId: number }) =>
      authed(token).delete(
        `api/v1/shoppinglists/${vars.shoppinglistId}/recipes/${vars.recipeId}`,
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useClearList(token: string) {
  return useApiMutation({
    mutationFn: (vars: { shoppinglistId: number }) =>
      authed(token).post(`api/v1/shoppinglists/${vars.shoppinglistId}/clear`),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useAddItem(token: string) {
  return useApiMutation({
    mutationFn: async (vars: {
      shoppinglistId: number;
      ingredient_id: number;
      quantity: string;
    }) =>
      v.parse(
        ShoppinglistItemSchema,
        await authed(token)
          .post(`api/v1/shoppinglists/${vars.shoppinglistId}/items`, {
            json: {
              ingredient_id: vars.ingredient_id,
              quantity: vars.quantity,
            },
          })
          .json(),
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useDeleteItem(token: string) {
  return useApiMutation({
    mutationFn: (vars: { shoppinglistId: number; item_id: number }) =>
      authed(token).delete(
        `api/v1/shoppinglists/${vars.shoppinglistId}/items/${vars.item_id}`,
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useUpdateQuantity(token: string) {
  return useApiMutation({
    mutationFn: (vars: {
      shoppinglistId: number;
      item_id: number;
      quantity_id: number;
      quantity: string;
    }) =>
      authed(token).put(
        `api/v1/shoppinglists/${vars.shoppinglistId}/items/${vars.item_id}/quantities/${vars.quantity_id}`,
        { json: { quantity: vars.quantity } },
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useDeleteQuantity(token: string) {
  return useApiMutation({
    mutationFn: (vars: {
      shoppinglistId: number;
      item_id: number;
      quantity_id: number;
    }) =>
      authed(token).delete(
        `api/v1/shoppinglists/${vars.shoppinglistId}/items/${vars.item_id}/quantities/${vars.quantity_id}`,
      ),
    invalidates: (vars) => [listKey(vars.shoppinglistId)],
  });
}

export function useUpdateItem(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      shoppinglistId: number;
      item_id: number;
      fields: { in_basket?: boolean; note?: string };
    }) => {
      await authed(token).put(
        `api/v1/shoppinglists/${vars.shoppinglistId}/items/${vars.item_id}`,
        { json: vars.fields },
      );
    },
    onMutate: async (vars) => {
      const previousShoppinglist = queryClient.getQueryData<Shoppinglist>(
        listKey(vars.shoppinglistId),
      );

      if (previousShoppinglist) {
        const updatedShoppinglist = structuredClone(previousShoppinglist);
        updatedShoppinglist.ingredients = updatedShoppinglist.ingredients.map(
          (item) =>
            item.id == vars.item_id ? { ...item, ...vars.fields } : item,
        );
        queryClient.setQueryData(
          listKey(vars.shoppinglistId),
          updatedShoppinglist,
        );
      }

      return { previousShoppinglist };
    },
    onError: (_err, vars, context) => {
      queryClient.setQueryData(
        listKey(vars.shoppinglistId),
        context?.previousShoppinglist,
      );
    },
    onSettled: async (_data, _err, vars) => {
      // If we have mutations "bottled up" because we've been offline for a bit,
      // then only invalidate the 'shoppinglists' on the last mutation...
      if (queryClient.isMutating() === 1) {
        console.log("Invalidating after last mutation...");
        await queryClient.invalidateQueries({
          queryKey: listKey(vars.shoppinglistId),
        });
      }
    },
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: listKey(vars.shoppinglistId) }),
  });
}
