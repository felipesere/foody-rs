import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as v from "valibot";
import { http, TimestampSchema, useApiMutation } from "./index.ts";

const FromRecipe = v.strictObject({
  kind: v.literal("from_recipe"),
  id: v.number(),
});

const Untracked = v.strictObject({
  kind: v.literal("untracked"),
  name: v.string(),
});

const MealKind = v.union([FromRecipe, Untracked]);

export type MealDetails = v.InferOutput<typeof MealKind>;

const MealSchema = v.strictObject({
  kind: v.literal("mealplan_meal"),
  id: v.number(),
  details: MealKind,
  section: v.nullable(v.string()),
  is_cooked: v.boolean(),
  created_at: TimestampSchema,
});

export type Meal = v.InferOutput<typeof MealSchema>;

export const MealplanSchema = v.strictObject({
  kind: v.literal("mealplan"),
  id: v.number(),
  name: v.string(),
  created_at: TimestampSchema,
  meals: v.array(MealSchema),
});

export type Mealplan = v.InferOutput<typeof MealplanSchema>;

export const MealplansSchema = v.strictObject({
  mealplans: v.array(MealplanSchema),
});

export function useMealplans() {
  return useQuery({
    queryKey: ["mealplans"],
    queryFn: async () => {
      const parsed = v.parse(
        MealplansSchema,
        await http.get("api/v1/mealplans").json(),
      );
      for (const plan of parsed.mealplans) {
        plan.meals.sort((a, b) => a.id - b.id);
      }
      return parsed;
    },
  });
}

export function useCreateMealplan() {
  return useApiMutation({
    mutationFn: async (vars: { name: string; keepUncooked: boolean }) =>
      v.parse(
        MealplanSchema,
        await http
          .post("api/v1/mealplans", {
            json: { name: vars.name, keep_uncooked: vars.keepUncooked },
          })
          .json(),
      ),
    invalidates: ["mealplans"],
  });
}

export function useDeleteMealplan() {
  return useApiMutation({
    mutationFn: (vars: { mealplanId: number }) =>
      http.delete(`api/v1/mealplans/${vars.mealplanId}`),
    invalidates: ["mealplans"],
  });
}

export function useClearMealplan() {
  return useApiMutation({
    mutationFn: (vars: { mealplanId: number }) =>
      http.post(`api/v1/mealplans/${vars.mealplanId}/clear`),
    invalidates: ["mealplans"],
  });
}

export function useAddMeal() {
  return useApiMutation({
    mutationFn: (vars: {
      mealplanId: number;
      details: MealDetails;
      section?: string;
    }) =>
      http.post(`api/v1/mealplans/${vars.mealplanId}/meals`, {
        json: { details: vars.details, section: vars.section },
      }),
    invalidates: ["mealplans"],
    onSuccess: (_data, vars) => {
      const what =
        vars.details.kind === "from_recipe"
          ? vars.details.id
          : vars.details.name;
      toast.info(`Added ${what} to mealplan ${vars.mealplanId}`);
    },
  });
}

export function useUpdateMeal() {
  return useApiMutation({
    mutationFn: (vars: {
      mealplanId: number;
      mealId: number;
      fields: { is_cooked?: boolean; section?: string };
    }) =>
      http.put(`api/v1/mealplans/${vars.mealplanId}/meals/${vars.mealId}`, {
        json: vars.fields,
      }),
    invalidates: ["mealplans"],
  });
}

export function useDeleteMeal() {
  return useApiMutation({
    mutationFn: (vars: { mealplanId: number; mealId: number }) =>
      http.delete(`api/v1/mealplans/${vars.mealplanId}/meals/${vars.mealId}`),
    invalidates: ["mealplans"],
  });
}

export function useAddPlanToShoppinglist() {
  return useApiMutation({
    mutationFn: (vars: { mealplanId: number; shoppinglistId: number }) =>
      http.post(
        `api/v1/mealplans/${vars.mealplanId}/shoppinglists/${vars.shoppinglistId}`,
      ),
    invalidates: (vars) => [
      ["mealplans"],
      ["shoppinglist", vars.shoppinglistId],
    ],
    onSuccess: (_data, vars) => {
      toast.info(`Added ${vars.mealplanId} to ${vars.shoppinglistId}`);
    },
  });
}
