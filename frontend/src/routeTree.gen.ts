/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as AuthImport } from './routes/_auth'
import { Route as AuthIndexImport } from './routes/_auth.index'
import { Route as AuthRecipesImport } from './routes/_auth.recipes'
import { Route as AuthIngredientsImport } from './routes/_auth.ingredients'
import { Route as AuthShoppinglistShoppinglistIdImport } from './routes/_auth.shoppinglist.$shoppinglistId'
import { Route as AuthRecipesRecipeIdEditImport } from './routes/_auth.recipes.$recipeId.edit'

// Create/Update Routes

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any)

const AuthIndexRoute = AuthIndexImport.update({
  path: '/',
  getParentRoute: () => AuthRoute,
} as any)

const AuthRecipesRoute = AuthRecipesImport.update({
  path: '/recipes',
  getParentRoute: () => AuthRoute,
} as any)

const AuthIngredientsRoute = AuthIngredientsImport.update({
  path: '/ingredients',
  getParentRoute: () => AuthRoute,
} as any)

const AuthShoppinglistShoppinglistIdRoute =
  AuthShoppinglistShoppinglistIdImport.update({
    path: '/shoppinglist/$shoppinglistId',
    getParentRoute: () => AuthRoute,
  } as any)

const AuthRecipesRecipeIdEditRoute = AuthRecipesRecipeIdEditImport.update({
  path: '/$recipeId/edit',
  getParentRoute: () => AuthRecipesRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_auth': {
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_auth/ingredients': {
      preLoaderRoute: typeof AuthIngredientsImport
      parentRoute: typeof AuthImport
    }
    '/_auth/recipes': {
      preLoaderRoute: typeof AuthRecipesImport
      parentRoute: typeof AuthImport
    }
    '/_auth/': {
      preLoaderRoute: typeof AuthIndexImport
      parentRoute: typeof AuthImport
    }
    '/_auth/shoppinglist/$shoppinglistId': {
      preLoaderRoute: typeof AuthShoppinglistShoppinglistIdImport
      parentRoute: typeof AuthImport
    }
    '/_auth/recipes/$recipeId/edit': {
      preLoaderRoute: typeof AuthRecipesRecipeIdEditImport
      parentRoute: typeof AuthRecipesImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  AuthRoute.addChildren([
    AuthIngredientsRoute,
    AuthRecipesRoute.addChildren([AuthRecipesRecipeIdEditRoute]),
    AuthIndexRoute,
    AuthShoppinglistShoppinglistIdRoute,
  ]),
  LoginRoute,
])

/* prettier-ignore-end */
