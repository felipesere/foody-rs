import { createFileRoute } from "@tanstack/react-router";
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
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";

export const Route = createFileRoute("/_auth/recipes")({
  component: RecipesPage,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();

  const { data: recipes } = useAllRecipes(token);

  return (
    <div className="content-grid">
      <ul className="grid gap-4">
        {recipes ? (
          recipes.recipes.map((recipe) => (
            <RecipeView key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p>Loading</p>
        )}
      </ul>
    </div>
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
      <div className="space-x-4">
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
      </div>
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

type BookSourceProps = Pick<Book, "title" | "page">;
function BookSource(props: BookSourceProps) {
  return (
    <div className="flex flex-row">
      <p className="mr-4">{props.title}</p>
      <p>{`p.${props.page}`}</p>
    </div>
  );
}

type WebsiteSourceProps = Pick<Website, "url">;
function WebsiteSource(props: WebsiteSourceProps) {
  return (
    <a target="_blank" href={props.url} rel="noreferrer">
      {new URL(props.url).hostname}
    </a>
  );
}
