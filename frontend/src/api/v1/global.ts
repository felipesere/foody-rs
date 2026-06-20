import * as v from "valibot";

export const TimestampSchema = v.pipe(
  v.string(),
  v.isoTimestamp(),
  v.transform((input) => new Date(input)),
);

// Test helper
export function printIssues(result: v.SafeParseResult<any>) {
  if (result.success) return "";
  return result.issues
    .map((i) => {
      const path = i.path?.map((p: any) => p.key).join(".") ?? "(root)";
      return `${path}: ${i.message}`;
    })
    .join("\n");
}
