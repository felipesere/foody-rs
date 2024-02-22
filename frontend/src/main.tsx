import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
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
import { Recipes } from "./recipesPage.tsx";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className={"stack"}>
        <nav className="content-grid bottom-line dotted-bg density-low">
          <ul className="horizontal space-between">
            <li>
              <Link
                activeProps={{
                  className: "active",
                }}
                className="small-padding black-border uppercase"
                to={"/"}
              >
                Shopping
              </Link>
            </li>
            <li>
              <Link
                activeProps={{
                  className: "active",
                }}
                className="small-padding black-border uppercase"
                to={"/ingredients"}
              >
                Ingredients
              </Link>
            </li>
            <li>
              <Link
                activeProps={{
                  className: "active",
                }}
                className="small-padding black-border uppercase"
                to={"/recipes"}
              >
                Recipes
              </Link>
            </li>

            <li>
              <Link
                activeProps={{
                  className: "active",
                }}
                className="small-padding black-border uppercase"
                to={"/login"}
              >
                Login
              </Link>
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
  component: Recipes,
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
