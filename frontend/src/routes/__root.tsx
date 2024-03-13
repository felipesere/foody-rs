import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { loadToken } from "../models/api.ts";
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
        <TanStackRouterDevtools />
      </>
    );
  },
});
