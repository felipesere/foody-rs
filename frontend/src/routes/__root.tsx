import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import React, { Suspense } from "react";
import { loadToken } from "../apis/user.ts";
import { Navbar } from "../navbar.tsx";

type Context = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<Context>()({
  beforeLoad: () => {
    const maybeToken = loadToken();

    return {
      token: maybeToken,
    };
  },
  component: () => {
    return (
      <>
        <div className={"space-y-4"}>
          <Navbar />
          <Outlet />
        </div>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
      </>
    );
  },
});

const TanStackRouterDevtools =
  import.meta.env.MODE === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );
