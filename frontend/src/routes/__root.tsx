import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Navbar } from "../navbar.tsx";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
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
