import { Link, createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { useAllRecipes } from "../apis/recipes.ts";
import type { Ingredient, ItemQuantity } from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { DottedLine } from "../components/dottedLine.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
import { Toggle } from "../components/toggle.tsx";
import { combineQuantities, humanize } from "../quantities.ts";

export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId")({
  component: ShoppingPage,
});

export function ShoppingPage() {
  const { shoppinglistId } = Route.useParams();
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);
  const recipes = useAllRecipes(token);

  if (shoppinglist.isLoading || recipes.isLoading) {
    return <p>Loading</p>;
  }

  if (shoppinglist.isError || recipes.isError) {
    return <p>Failed to load shoppinglist or recipes</p>;
  }

  if (shoppinglist.data?.ingredients.length === 0) {
    return <p>List has no items</p>;
  }

  const allRecipes =
    recipes.data?.recipes.reduce(
      (acc, recipe) => {
        acc[recipe.id] = recipe.name;
        return acc;
      },
      {} as Record<number, string>,
    ) || {};

  return (
    <div className="content-grid space-y-4 max-w-md">
      <Toggle buttonLabel={"Add Ingredient"}>
        <FindIngredient token={token} />
      </Toggle>
      <ul className="grid max-w-md gap-4">
        {shoppinglist.data?.ingredients.map((ingredient) => (
          <IngredientView
            key={ingredient.name}
            ingredient={ingredient}
            allRecipes={allRecipes}
          />
        ))}
      </ul>
    </div>
  );
}

function IngredientView({
  ingredient,
  allRecipes,
}: { ingredient: Ingredient; allRecipes: Record<number, string> }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const totalQuantity = combineQuantities(ingredient.quantities);
  return (
    <li
      className={classnames(
        "shadow border-black border-solid border-2 p-2 col-span-2",
        { "grid grid-cols-subgrid": true },
      )}
    >
      <div>
        <div className="flex flex-col">
          <div className="flex flex-row">
            <input
              className="checkbox"
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((checked) => !checked)}
            />
            <p
              className={classnames(
                "capitalize ml-2 font-black tracking-wider",
                {
                  "line-through": checked,
                },
              )}
            >
              {ingredient.name}
            </p>
          </div>
          <hr className={"w-full border-t border-solid border-black"} />
          {!open && (
            <div className="flex flex-row justify-between font-light">
              <p>Quantity:</p>
              <p>{totalQuantity}</p>
            </div>
          )}
          {open && (
            <div>
              <p>Parts:</p>
              <ol>
                {ingredient.quantities.map((q) => (
                  <Part key={q.id} quantity={q} recipes={allRecipes} />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      <div className={"flex flex-col justify-between"}>
        <p className={"font-light"}>Some aisle</p>
        <button
          className={classnames(
            "border-black border-double border-4 hover:bg-gray-100",
            {
              shadow: !open,
            },
          )}
          type={"submit"}
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          Details
        </button>
      </div>
    </li>
  );
}

type PartProps = {
  quantity: ItemQuantity;
  recipes: Record<number, string>;
};
function Part({ quantity, recipes }: PartProps) {
  const [checked, setChecked] = useState(false);

  const className = classnames("overflow-hidden text-nowrap text-ellipsis", {
    "line-through": checked,
  });

  const recipe = quantity.recipe_id ? (
    <Link className={className} to={"/recipes"}>
      {recipes[quantity.recipe_id]}
    </Link>
  ) : (
    <p className={className}>manual</p>
  );

  return (
    <li className="flex flex-row font-light">
      <input
        className={"flex-shrink-0 flex-grow-0"}
        type={"checkbox"}
        checked={checked}
        onChange={() => setChecked((checked) => !checked)}
      />
      <div className={"flex flex-shrink ml-2 min-w-0"}>
        {recipe}
        <DottedLine />
      </div>
      <p className="flex-grow-0 flex-shrink-0">{humanize(quantity)}</p>
    </li>
  );
}
