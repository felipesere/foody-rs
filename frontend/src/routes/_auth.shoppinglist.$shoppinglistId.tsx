import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { useAllRecipes } from "../apis/recipes.ts";
import {
  type Ingredient,
  useToggleIngredientInShoppinglist,
} from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { FindIngredient } from "../components/findIngredient.tsx";
import { KebabMenu } from "../components/kebabMenu.tsx";
import { Toggle } from "../components/toggle.tsx";
import { combineQuantities } from "../quantities.ts";

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
  ingredient,
  onToggle,
}: {
  ingredient: Ingredient;
  // Would be used once we expand the `quantities` per recipe
  allRecipes: Record<number, string>;
  onToggle: (ingredient: Ingredient["id"], inBasket: boolean) => void;
}) {
  const inBasket = ingredient.quantities.some((q) => q.in_basket);
  const [checked, setChecked] = useState(inBasket);

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
        <p
          className={classnames(
            "flex-grow inline capitalize ml-2 font-black tracking-wider",
          )}
        >
          {ingredient.name}
        </p>
        <p>{combineQuantities(ingredient.quantities)}</p>
        <KebabMenu className={"ml-2"}>
          <KebabMenu.Button
            style={"dark"}
            value={"Delete"}
            onClick={() => console.log("hi there!")}
          />
          <KebabMenu.Button
            style={"plain"}
            value={"Edit"}
            onClick={() => console.log("hi there!")}
          />
          <KebabMenu.Button
            style={"plain"}
            value={"Other thing"}
            onClick={() => console.log("hi there!")}
          />
        </KebabMenu>
      </div>
    </li>
  );
}
