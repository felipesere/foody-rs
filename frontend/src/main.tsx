import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  LinkProps,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { IndexPage } from "./indexPage.tsx";
import { IngredientsPage } from "./ingredientsPage.tsx";
import { LoginPage } from "./loginPage.tsx";
import { RecipesPage } from "./recipesPage.tsx";

import "./index.css";

function NavLink(params: { name: string; to: LinkProps["to"] }) {
  return (
    <Link
      activeProps={{
        className: "bg-gray-200",
      }}
      className="p-2 bg-white text-black border-black border-2 border-solid uppercase"
      to={params.to}
    >
      {params.name}
    </Link>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className={"space-y-4"}>
        <nav className="content-grid pt-4 border-solid border-black border-b-2 dotted-bg">
          <ul className="mb-4 flex flex-row justify-between">
            <li>
              <NavLink name={"Shopping"} to={"/"} />
            </li>
            <li>
              <NavLink name={"Ingredients"} to={"/ingredients"} />
            </li>
            <li>
              <NavLink name={"Recipes"} to={"/recipes"} />
            </li>
            <li>
              <NavLink name={"Login"} to={"/login"} />
            </li>
          </ul>
        </nav>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

const ingredientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ingredients",
  component: IngredientsPage,
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes",
  component: RecipesPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  ingredientsRoute,
  recipesRoute,
  loginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
