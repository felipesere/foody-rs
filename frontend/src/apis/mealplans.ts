import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { http } from "./http.ts";
import { WithIdSchema } from "./recipes.ts";
import type { Shoppinglist } from "./shoppinglists.ts";
import { newToOld, oldToNew } from "./sorting.ts";

const DetailsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("from_recipe"),
    id: z.number(),
  }),
  z.object({
    type: z.literal("untracked"),
    name: z.string(),
  }),
]);

const MealSchema = z.object({
  section: z.string().nullable(),
  details: DetailsSchema,
  is_cooked: z.boolean(),
  created_at: z.string().datetime().pipe(z.coerce.date()),
});

export type Meal = z.infer<typeof MealSchema>;

const StoredMealSchema = WithIdSchema.merge(MealSchema);

export type StoredMeal = z.infer<typeof StoredMealSchema>;

const MealPlanSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime().pipe(z.coerce.date()),
  name: z.string(),
  meals: z.array(StoredMealSchema),
});

export type MealPlan = z.infer<typeof MealPlanSchema>;

const MealPlansSchema = z.object({
  meal_plans: z.array(MealPlanSchema),
});

export function useAllMealPlans(token: string) {
  return useQuery({
    queryKey: ["mealplans"],
    queryFn: async () => {
      const body = await http
        .get("api/mealplans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      const meals = MealPlansSchema.parse(body);
      meals.meal_plans.sort(newToOld("created_at"));
      for (const plan of meals.meal_plans) {
        plan.meals.sort(oldToNew("created_at"));
      }

      return meals;
    },
  });
}

export function useCreateMealPlan(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string; keepUncooked: boolean }) => {
      const body = await http
        .post("api/mealplans", {
          json: {
            name: params.name,
            keep_uncooked: params.keepUncooked,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .json();

      return MealPlanSchema.parse(body);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

type AddMealParams = { mealPlan: MealPlan["id"]; details: Meal["details"] };

export function useAddRecipeToMealplan(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: AddMealParams) => {
      await http.post(`api/mealplans/${params.mealPlan}/meal`, {
        json: {
          details: params.details,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: async (_, vars) => {
      await client.invalidateQueries({ queryKey: ["mealplans"] });
      if (vars.details.type === "from_recipe") {
        toast.info(`Added ${vars.details.id} to ${vars.mealPlan}`);
      } else {
        toast.info(`Added ${vars.details.name} to ${vars.mealPlan}`);
      }
    },
  });
}

type ToggleMealIsCookedParams = Pick<StoredMeal, "id" | "is_cooked">;

export function useToggleMealIsCooked(
  token: string,
  meal_plan_id: MealPlan["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: ToggleMealIsCookedParams) => {
      await http.post(
        `api/mealplans/${meal_plan_id}/meal/${params.id}/cooked`,
        {
          json: {
            is_cooked: params.is_cooked,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

export function useDeleteMealFromMealPlan(
  token: string,
  meal_plan_id: MealPlan["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: StoredMeal["id"] }) => {
      await http.delete(`api/mealplans/${meal_plan_id}/meal/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

export function useSetSectionOfMeal(
  token: string,
  meal_plan_id: MealPlan["id"],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: StoredMeal["id"]; section: string }) => {
      await http.post(
        `api/mealplans/${meal_plan_id}/meal/${params.id}/section`,
        {
          json: {
            section: params.section,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

export function useClearMealplan(token: string, meal_plan_id: MealPlan["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await http.post(`api/mealplans/${meal_plan_id}/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

export function useRemoveMealplan(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: MealPlan["id"] }) => {
      await http.delete(`api/mealplans/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["mealplans"] });
    },
  });
}

export function useAddPlanToShoppinglist(token: string, id: MealPlan["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { shoppinglist: Shoppinglist["id"] }) => {
      await http.post(`api/mealplans/${id}/shoppinglist`, {
        json: {
          shoppinglist: params.shoppinglist,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_, vars) => {
      toast.info(`Added ${id} to ${vars.shoppinglist}`);
      client.invalidateQueries({ queryKey: ["mealplans"] });
      client.invalidateQueries({ queryKey: ["shoppinglist"] });
    },
  });
}
