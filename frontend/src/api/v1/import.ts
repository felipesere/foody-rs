import { HTTPError } from "ky";
import * as v from "valibot";
import { http, useApiMutation } from "./index.ts";

/** Counts the backend reports back after a successful import. */
export const ImportSummarySchema = v.strictObject({
  imported: v.strictObject({
    aisles: v.number(),
    ingredients: v.number(),
    recipes: v.number(),
    mealplans: v.number(),
    shoppinglists: v.number(),
  }),
});

export type ImportSummary = v.InferOutput<typeof ImportSummarySchema>;

const ImportErrorSchema = v.object({ errors: v.array(v.string()) });

/** Pulls the backend's `{ errors: [...] }` message out of a failed import so we
 * can show why the file was rejected rather than a bare HTTP status. */
export async function importErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    const body = await error.response.json().catch(() => null);
    const parsed = v.safeParse(ImportErrorSchema, body);
    if (parsed.success) return parsed.output.errors.join("\n");
  }
  return error instanceof Error ? error.message : "Import failed";
}

/** Uploads a JSON export as a multipart file. The import replaces every
 * collection for the current group, so invalidate broadly to pull the freshly
 * imported data back into the app. */
export function useImport() {
  return useApiMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.set("file", file);
      return v.parse(
        ImportSummarySchema,
        await http.post("api/v1/import", { body }).json(),
      );
    },
    invalidates: () => [
      ["aisles"],
      ["ingredients"],
      ["recipes"],
      ["recipe"],
      ["mealplans"],
      ["shoppinglists"],
      ["shoppinglist"],
    ],
  });
}
