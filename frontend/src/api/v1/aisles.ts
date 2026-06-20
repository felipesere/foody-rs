import * as v from "valibot";

export const AisleSchema = v.object({
  id: v.number(),
  name: v.string(),
  order: v.number(),
});

export const AislesSchema = v.object({
  aisles: v.array(AisleSchema),
});
