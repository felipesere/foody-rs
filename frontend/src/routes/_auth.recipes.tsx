import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import {
  Book,
  Ingredient,
  Recipe,
  Website,
  useAllRecipes,
} from "../apis/recipes.ts";
import { DottedLine } from "../misc/dottedLine.tsx";

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
            <RecipeView key={recipe.name} recipe={recipe} />
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
  const [open, setOpen] = useState(false);
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
          <hr className={"w-full border-t border-solid border-black"} />
          <p className="uppercase">Ingredients:</p>
          <ul>
            {props.recipe.ingredients.map((ingredient) => (
              <IngredientView key={ingredient.name} ingredient={ingredient} />
            ))}
          </ul>
        </div>
      ) : null}
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
        <button type="submit" className="px-2 text-black bg-gray-300 shadow">
          Add
        </button>
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
