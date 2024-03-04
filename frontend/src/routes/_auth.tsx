import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  // Before loading, authenticate the user via data in the query cache
  // This will also happen during prefetching (e.g. hovering over links, etc)
  beforeLoad: ({ context, location }) => {
    // If there is no token for the user, redirect them to the login page
    const token = context.queryClient.getQueryData(["user", "token"]);
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
    const profile = context.queryClient.getQueryData(["user", "profile"]);

    // Otherwise, return the user in context
    return {
      profile,
    };
  },
});
