import ky from "ky";
import * as v from "valibot";
import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

export const TimestampSchema = v.pipe(
  v.string(),
  v.isoTimestamp(),
  v.transform((input) => new Date(input)),
);

/** Origin of the Rails backend. Same-origin in production (Rails serves the
 * bundle); the Vite dev server runs on a different port. Exported for full-page
 * auth redirects (e.g. `${apiBase}/auth/login`) that can't go through ky. */
export const apiBase =
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? "http://localhost:3000"
    : "";

// `credentials: "include"` sends the Rails session cookie on every request, so
// authentication rides on the cookie rather than a bearer token. CORS in dev
// allows credentials from the Vite origin (see backend config/initializers/cors.rb).
export const http = ky.create({
  prefixUrl: apiBase || "/",
  credentials: "include",
});

/**
 * useMutation with built-in query invalidation. Pass `invalidates` a query key
 * (or a function deriving keys from the mutation variables) and they'll be
 * invalidated onSettled. Any other useMutation option is passed through.
 */
export function useApiMutation<TVars, TData = unknown>(
  options: UseMutationOptions<TData, Error, TVars> & {
    invalidates?: QueryKey | ((vars: TVars) => QueryKey[]);
  },
) {
  const queryClient = useQueryClient();
  const { invalidates, onSettled, ...rest } = options;
  return useMutation<TData, Error, TVars>({
    ...rest,
    onSettled: async (...args) => {
      const vars = args[2];
      if (invalidates) {
        const keys =
          typeof invalidates === "function"
            ? invalidates(vars)
            : [invalidates];
        await Promise.all(
          keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
        );
      }
      await onSettled?.(...args);
    },
  });
}

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
