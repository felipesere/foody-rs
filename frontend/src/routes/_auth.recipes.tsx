import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Book,
  type Ingredient,
  type Recipe,
  type Website,
  addRecipeToShoppinglist,
  useAllRecipes,
} from "../apis/recipes.ts";
import { AddToShoppinglist } from "../components/addToShoppinglist.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";

export const Route = createFileRoute("/_auth/recipes")({
  component: RecipesPage,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();
  const { data, isLoading, isError } = useAllRecipes(token);

  if (isError) {
    return <p>Error</p>;
  }

  if (isLoading) {
    return <p>Loading</p>;
  }

  return (
    <>
      <Outlet />
      <div className="content-grid">
        <ul className="grid gap-4">
          {data?.recipes.map((recipe) => (
            <RecipeView key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      </div>
    </>
  );
}

type RecipeProps = {
  recipe: Recipe;
};

function RecipeView(props: RecipeProps) {
  const { token } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const addRecipe = addRecipeToShoppinglist(token);
  const recipeId = props.recipe.id;
  const navigate = useNavigate({ from: "/recipes" });

  return (
    <li className="p-2 border-black border-solid border-2">
      <p className="font-black uppercase tracking-wider">{props.recipe.name}</p>
      <div>
        {props.recipe.source === "book" ? (
          <BookSource title={props.recipe.title} page={props.recipe.page} />
        ) : (
          <WebsiteSource url={props.recipe.url} />
        )}
      </div>
      {open ? (
        <div>
          <Divider />
          <p className="uppercase">Ingredients:</p>
          <ul>
            {props.recipe.ingredients.map((ingredient) => (
              <IngredientView key={ingredient.name} ingredient={ingredient} />
            ))}
          </ul>
        </div>
      ) : null}
      <Divider />
      <ButtonGroup>
        <button
          className={classnames("px-2", {
            "double-border": open,
            shadow: !open,
          })}
          type={"submit"}
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          Details
        </button>
        <button
          className={classnames("px-2", {
            "double-border": open,
            shadow: !open,
          })}
          type={"submit"}
          onClick={() =>
            navigate({
              to: "/recipes/$recipeId/edit",
              params: { recipeId: props.recipe.id.toString() },
            })
          }
        >
          Edit
        </button>
        <AddToShoppinglist
          token={token}
          onSelect={(shoppinglist) => {
            addRecipe.mutate({ shoppinglistId: shoppinglist.id, recipeId });
            toast(
              `Added "${props.recipe.name}" to shoppinglist "${shoppinglist.name}"`,
            );
          }}
        />
        <button type="submit" className="px-2 text-white bg-gray-700 shadow">
          Delete
        </button>
      </ButtonGroup>
    </li>
  );
}

function IngredientView({ ingredient }: { ingredient: Ingredient }) {
  return (
    <li className="flex flex-row justify-between">
      <p className="font-light text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {ingredient.name}
      </p>
      <DottedLine />
      <p className="text-light" style={{ flex: "none" }}>
        {ingredient.quantity[0].value} {ingredient.quantity[0].unit}
      </p>
    </li>
  );
}

export type BookSourceProps = Pick<Book, "title" | "page">;
export function BookSource(props: BookSourceProps) {
  return (
    <div className="flex flex-row">
      <p className="mr-4">{props.title}</p>
      <p>{`p.${props.page}`}</p>
    </div>
  );
}

export type WebsiteSourceProps = Pick<Website, "url">;
export function WebsiteSource(props: WebsiteSourceProps) {
  return (
    <a target="_blank" href={props.url} rel="noreferrer">
      {new URL(props.url).hostname}
    </a>
  );
}
