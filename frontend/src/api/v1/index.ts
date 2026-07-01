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

const prefixUrl =
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? "http://localhost:3000"
    : "/";

export const http = ky.create({
  prefixUrl,
});

/** A ky instance with the bearer token baked into every request. */
export function authed(token: string) {
  return http.extend({
    headers: { Authorization: `Bearer ${token}` },
  });
}

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
