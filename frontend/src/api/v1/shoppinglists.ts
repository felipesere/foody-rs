import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as v from "valibot";
import { AisleSchema } from "./aisles.ts";
import { http, TimestampSchema } from "./index.ts";
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

export type Placeholder = "placeholder";

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

export const client = function (token: string) {
  return {
    index: () => {
      return useQuery({
        queryKey: ["ingredients"],
        queryFn: async () => {
          const body = await http
            .get("api/v1/shoppinglists", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .json();

          return v.parse(ShoppinglistsSchema, body);
        },
      });
    },
    list: function (shoppinglistId: number | Placeholder) {
      return {
        show: () => {
          return useQuery({
            queryKey: ["shoppinglist", shoppinglistId],
            refetchInterval: 2000, // ms
            refetchIntervalInBackground: true,
            queryFn: async () => {
              const body = await http
                .get(`api/v1/shoppinglists/${shoppinglistId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                .json();

              return v.parse(ShoppinglistSchema, body);
            },
          });
        },
        removeRecipe: () => {
          let queryClient = useQueryClient();
          return useMutation({
            mutationFn: async (params: { recipeId: number }) => {
              return http.delete(
                `api/v1/shoppinglists/${shoppinglistId}/recipes/${params.recipeId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
            },
            onSettled: async () => {
              await queryClient.invalidateQueries({
                queryKey: ["shoppinglist", shoppinglistId],
              });
            },
          });
        },
        clear: () => {
          let queryClient = useQueryClient();
          return useMutation({
            mutationFn: async () => {
              return http.post(`api/v1/shoppinglists/${shoppinglistId}/clear`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            },
            onSettled: async () => {
              await queryClient.invalidateQueries({
                queryKey: ["shoppinglist", shoppinglistId],
              });
            },
          });
        },
        items: () => {
          return {
            item: (itemId: number) => {
              return {
                quantity: () => {
                  return {
                    update: () => {
                      let queryClient = useQueryClient();
                      return useMutation({
                        mutationFn: async (params: {
                          quantity_id: number;
                          quantity: string;
                        }) => {
                          return http.put(
                            `api/v1/shoppinglists/${shoppinglistId}/items/${itemId}/quantities/${params.quantity_id}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                              json: {
                                quantity: params.quantity,
                              },
                            },
                          );
                        },
                        onSettled: async () => {
                          await queryClient.invalidateQueries({
                            queryKey: ["shoppinglist", shoppinglistId],
                          });
                        },
                      });
                    },
                    delete: () => {
                      let queryClient = useQueryClient();
                      return useMutation({
                        mutationFn: async (params: { quantity_id: number }) => {
                          return http.delete(
                            `api/v1/shoppinglists/${shoppinglistId}/items/${itemId}/quantities/${params.quantity_id}`,
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            },
                          );
                        },
                        onSettled: async () => {
                          await queryClient.invalidateQueries({
                            queryKey: ["shoppinglist", shoppinglistId],
                          });
                        },
                      });
                    },
                  };
                },
              };
            },
            create: () => {
              let queryClient = useQueryClient();
              return useMutation({
                mutationFn: async (params: {
                  ingredient_id: number;
                  quantity: string;
                  shoppinglistId?: number;
                }) => {
                  const listId =
                    shoppinglistId === "placeholder"
                      ? params.shoppinglistId!
                      : shoppinglistId;
                  const body = await http.post(
                    `api/v1/shoppinglists/${listId}/items`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      json: {
                        ingredient_id: params.ingredient_id,
                        quantity: params.quantity,
                      },
                    },
                  );

                  return v.parse(ShoppinglistItemSchema, body);
                },
                onSettled: async (_a, _b, params) => {
                  const listId =
                    shoppinglistId === "placeholder"
                      ? params.shoppinglistId!
                      : shoppinglistId;
                  await queryClient.invalidateQueries({
                    queryKey: ["shoppinglist", listId],
                  });
                },
              });
            },
            delete: () => {
              let queryClient = useQueryClient();
              return useMutation({
                mutationFn: async (params: { item_id: number }) => {
                  return http.delete(
                    `api/v1/shoppinglists/${shoppinglistId}/items/${params.item_id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  );
                },
                onSettled: async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["shoppinglist", shoppinglistId],
                  });
                },
              });
            },
            update: () => {
              let queryClient = useQueryClient();
              return useMutation({
                mutationFn: async (params: {
                  item_id: number;
                  fields: {
                    in_basket?: boolean;
                    note?: string;
                  };
                }) => {
                  await http.put(
                    `api/v1/shoppinglists/${shoppinglistId}/items/${params.item_id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      json: params.fields,
                    },
                  );
                },
                onMutate: async (params) => {
                  const previousShoppinglist =
                    queryClient.getQueryData<Shoppinglist>([
                      "shoppinglist",
                      shoppinglistId,
                    ]);

                  if (previousShoppinglist) {
                    const updatedShoppinglist =
                      structuredClone(previousShoppinglist);
                    updatedShoppinglist.ingredients =
                      updatedShoppinglist.ingredients.map((item) => {
                        if (item.id == params.item_id) {
                          return { ...item, ...params.fields };
                        } else {
                          return item;
                        }
                      });
                    queryClient.setQueryData(
                      ["shoppinglist", shoppinglistId],
                      updatedShoppinglist,
                    );
                  }

                  return { previousShoppinglist };
                },
                onError: (_err, _params, context) => {
                  queryClient.setQueryData(
                    ["shoppinglist", shoppinglistId],
                    context?.previousShoppinglist,
                  );
                },
                onSettled: async () => {
                  // If we have mutations "bottled up" because we've been offline for a bit,
                  // then only invalidate the 'shoppinglists' on the last mutation...
                  if (queryClient.isMutating() === 1) {
                    console.log("Invalidating after last mutation...");
                    await queryClient.invalidateQueries({
                      queryKey: ["shoppinglist", shoppinglistId],
                    });
                  }
                },
                onSuccess: () => {
                  return queryClient.invalidateQueries({
                    queryKey: ["shoppinglist", shoppinglistId],
                  });
                },
              });
            },
          };
        },
      };
    },
  };
};
