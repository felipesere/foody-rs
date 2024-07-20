import { useQueryClient } from "@tanstack/react-query";
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
  useDeleteRecipe,
  useRecipeOptions,
} from "../apis/recipes.ts";
import { AddToShoppinglist } from "../components/addToShoppinglist.tsx";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";

export const Route = createFileRoute("/_auth/recipes")({
  component: RecipesPage,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();
  const { data, isLoading, isError } = useAllRecipes(token);
  const navigate = useNavigate({ from: Route.path });

  if (isError) {
    return <p>Error</p>;
  }

  if (isLoading) {
    return <p>Loading</p>;
  }

  return (
    <>
      <Outlet />
      <div className="content-grid space-y-4">
        <ButtonGroup>
          <Button
            onClick={() => navigate({ to: "/recipes/new" })}
            label={"New Recipe"}
          />
        </ButtonGroup>
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
  const deleteRecipe = useDeleteRecipe(token);
  const recipeId = props.recipe.id;
  const navigate = useNavigate({ from: "/recipes" });
  const client = useQueryClient();

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
            {
                props.recipe.tags.length > 0 && (
                    <>
                        <Divider />
                        <ol className={"flex flex-row gap-2"}>
                            {props.recipe.tags.map((tag) => (<p key={tag}>#{tag}</p>))}
                        </ol>
                    </>
                )
            }
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
          onMouseEnter={(_) => {
            client.prefetchQuery(useRecipeOptions(token, recipeId));
          }}
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
        <button
          type="submit"
          className="px-2 text-white bg-gray-700 shadow"
          onClick={() => deleteRecipe.mutate(recipeId)}
        >
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
      {maybeHostname(props.url)}
    </a>
  );
}

function maybeHostname(v: string): string {
  try {
    return new URL(v).hostname;
  } catch (err) {
    return v;
  }
}
