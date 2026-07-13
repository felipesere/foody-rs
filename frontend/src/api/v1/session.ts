import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as v from "valibot";
import { apiBase, http } from "./index.ts";

export const UserSchema = v.object({
  kind: v.literal("user"),
  id: v.number(),
  name: v.string(),
  email: v.string(),
  group: v.object({
    id: v.number(),
    name: v.string(),
  }),
});

export type User = v.InferOutput<typeof UserSchema>;

/** The signed-in user, or a rejected query (401) when there is no session.
 * Drives the auth guard and the navbar greeting. */
export function meQueryOptions() {
  return queryOptions({
    queryKey: ["me"],
    queryFn: async () =>
      v.parse(UserSchema, await http.get("api/v1/me").json()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/** Full-page redirect into the Pocket ID login flow. Rails sets the session
 * cookie on callback and redirects back to the app. */
export function login() {
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? http.post("dev/login", {
        json: {
          as: "felipe@example.com",
        },
      })
    : (window.location.href = `${apiBase}/auth/login`);
}

/** Drops the Rails session, forgets the cached user, and returns to /login. */
export function useLogout(): () => Promise<void> {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    await http.delete("auth/session");
    queryClient.removeQueries({ queryKey: ["me"] });
    await navigate({ to: "/login" });
  };
}
