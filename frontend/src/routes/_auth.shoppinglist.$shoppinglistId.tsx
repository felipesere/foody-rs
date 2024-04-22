import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { useAllRecipes } from "../apis/recipes.ts";
import {
  type Ingredient,
  type Shoppinglist,
  useRemoveIngredientFromShoppinglist,
  useToggleIngredientInShoppinglist,
} from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { DottedLine } from "../components/dottedLine.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { combineQuantities, humanize } from "../quantities.ts";

export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId")({
  component: ShoppingPage,
});

export function ShoppingPage() {
  const params = Route.useParams();
  const shoppinglistId = Number(params.shoppinglistId);
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);
  const recipes = useAllRecipes(token);

  const toggleIngredient = useToggleIngredientInShoppinglist(
    token,
    shoppinglistId,
  );

  if (shoppinglist.isLoading || recipes.isLoading) {
    return <p>Loading</p>;
  }

  if (shoppinglist.isError || recipes.isError) {
    return <p>Failed to load shoppinglist or recipes</p>;
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
        <FindIngredient token={token} shoppinglistId={shoppinglistId} />
      </Toggle>
      <ul className="grid max-w-md gap-4">
        {shoppinglist.data?.ingredients.map((ingredient) => (
          <CompactIngredientView
            key={ingredient.name}
            token={token}
            shoppinglistId={shoppinglistId}
            ingredient={ingredient}
            allRecipes={allRecipes}
            onToggle={(ingredientId, inBasket) =>
              toggleIngredient.mutate({ ingredientId, inBasket })
            }
          />
        ))}
      </ul>
    </div>
  );
}

function CompactIngredientView({
  token,
  ingredient,
  shoppinglistId,
  onToggle,
  allRecipes,
}: {
  token: string;
  ingredient: Ingredient;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  onToggle: (ingredient: Ingredient["id"], inBasket: boolean) => void;
}) {
  const inBasket = ingredient.quantities.some((q) => q.in_basket);
  const [checked, setChecked] = useState(inBasket);
  const [open, setOpen] = useState(false);

  const deleteIngredient = useRemoveIngredientFromShoppinglist(
    token,
    shoppinglistId,
  );
  return (
    <li
      className={classnames("border-black border-solid border-2 p-2", {
        "bg-gray-200 text-gray-500": checked,
      })}
    >
      <div
        className={classnames("flex flex-row", {
          "line-through": checked,
        })}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            onToggle(ingredient.id, !checked);
            setChecked((checked) => !checked);
          }}
        />
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Very unlikely this will be navigated via keyboard as its
         the shoppinglist view for when we are in the store...*/}
        <p
          onClick={() => {
            onToggle(ingredient.id, !checked);
            setChecked((checked) => !checked);
          }}
          className={classnames(
            "flex-grow inline capitalize ml-2 font-black tracking-wider",
          )}
        >
          {ingredient.name}
        </p>
        <p>{combineQuantities(ingredient.quantities)}</p>
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
      </div>
      {open && (
        <div>
          <hr className="h-0.5 my-2 bg-black border-0" />
          {ingredient.quantities.map((quantity) => (
            <div key={quantity.id} className={"flex flex-row"}>
              <span className={"w-5"} />
              <p className={"ml-2"}>
                {quantity.recipe_id
                  ? allRecipes[quantity.recipe_id] || "Manual"
                  : "Manual"}
              </p>
              <DottedLine />
              <p>{humanize(quantity)}</p>
              <span className={"w-7"} />
            </div>
          ))}
          <hr className="h-0.5 my-2 bg-black border-0" />
          <div className={"flex flex-row gap-2 justify-end"}>
            <button type={"button"} className={"px-2"}>
              Edit
            </button>
            <button
              type={"button"}
              className={"px-2 bg-black text-white"}
              onClick={() =>
                deleteIngredient.mutate({ ingredient: ingredient.name })
              }
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
