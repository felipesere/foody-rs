import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "./http.ts";

const DetailsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("from_recipe"),
    id: z.string(),
  }),
  z.object({
    type: z.literal("untracked_meal"),
    name: z.string(),
  }),
]);

const MealSchema = z.object({
  id: z.number(),
  section: z.string().nullable(),
  details: DetailsSchema,
});

const MealPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  meals: z.array(MealSchema),
});

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
