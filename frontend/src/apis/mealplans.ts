import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { http } from "./http.ts";
import { WithIdSchema } from "./recipes.ts";

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
});

export type Meal = z.infer<typeof MealSchema>;

const StoredMealSchema = WithIdSchema.merge(MealSchema);

export type StoredMeal = z.infer<typeof StoredMealSchema>;

const MealPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  meals: z.array(StoredMealSchema),
});

type MealPlan = z.infer<typeof MealPlanSchema>;

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

      return MealPlansSchema.parse(body);
    },
  });
}

export function useCreateMealPlan(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: { name: string }) => {
      await http.post("api/mealplans", {
        json: params,
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

type AddMealParams = Pick<Meal, "details" | "section">;

export function useAddMealToPlan(token: string, id: MealPlan["id"]) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (params: AddMealParams) => {
      await http.post(`api/mealplans/${id}/meal`, {
        json: params,
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
