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
import "./app.css";
import { IndexPage } from "./indexPage.tsx";
import { IngredientsPage } from "./ingredientsPage.tsx";
import { LoginPage } from "./loginPage.tsx";
import { RecipesPage } from "./recipesPage.tsx";

function NavLink(params: { name: string; to: LinkProps["to"] }) {
  return (
    <Link
      activeProps={{
        className: "active",
      }}
      className="small-padding black-border uppercase"
      to={params.to}
    >
      {params.name}
    </Link>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className={"stack"}>
        <nav className="content-grid bottom-line dotted-bg density-low">
          <ul className="horizontal space-between">
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
