import { createFileRoute, redirect } from "@tanstack/react-router";
import { meQueryOptions } from "../api/v1/session.ts";

export const Route = createFileRoute("/_auth")({
  // Gate every authenticated route on a live Rails session: fetch /api/v1/me
  // (cached in the query client). A 401 means no session, so bounce to login.
  beforeLoad: async ({ context, location }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions());
    } catch {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
