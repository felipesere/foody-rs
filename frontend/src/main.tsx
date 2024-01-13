import {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import {Link, Outlet, RootRoute, Route, Router, RouterProvider} from "@tanstack/react-router";
import {TanStackRouterDevtools} from "@tanstack/router-devtools";
import "./app.css";
import {IndexPage} from "./indexPage.tsx";
import {IngredientsPage} from "./ingredientsPage.tsx";
import {Recipes} from "./recipesPage.tsx";

const rootRoute = new RootRoute({
    component: () => (
        <>
            <div className={"stack"}>
                <nav className="content-grid bottom-line dotted-bg" style={{"--density": 3} as any}>
                    <ul role="list" className="horizontal space-between">
                        <li>
                            <Link
                                activeProps={{
                                    className: "active",
                                }}
                                className="small-padding black-border uppercase"
                                to={"/"}
                            >Shopping</Link>
                        </li>
                        <li>
                            <Link
                                activeProps={{
                                    className: "active",
                                }}
                                className="small-padding black-border uppercase"
                                to={"/ingredients"}
                            >Ingredients</Link
                            >
                        </li>
                        <li>
                            <Link
                                activeProps={{
                                    className: "active",
                                }}
                                className="small-padding black-border uppercase"
                                  to={"/recipes"}
                            >Recipes</Link>
                        </li>
                    </ul>
                </nav>
                <Outlet/>
            </div>
            <TanStackRouterDevtools/>
        </>
    ),
})

const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: IndexPage,
})

const ingredientsRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/ingredients',
    component: IngredientsPage,
})

const recipesRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/recipes',
    component: Recipes,
})

const routeTree = rootRoute.addChildren([indexRoute, ingredientsRoute, recipesRoute])

const router = new Router({routeTree})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <RouterProvider router={router}/>
        </StrictMode>,
    )
}
