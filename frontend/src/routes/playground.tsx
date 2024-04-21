import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import classnames from "classnames";
import { combineQuantities, humanize } from "../quantities.ts";
// import { KebabMenu } from "../components/kebabMenu.tsx";
import type { Ingredient } from "../apis/shoppinglists.ts";
import { DottedLine } from "../components/dottedLine.tsx";
import {KebabMenu} from "../components/kebabMenu.tsx";
import {Toggle, ToggleButton} from "../components/toggle.tsx";

export const Route = createFileRoute("/playground")({
  component: Playground,
});

type MyIngredient = Ingredient & { open: boolean };

export function Playground() {
  const recipes: Record<number, string> = {
    2: "Leek and Potato soup",
    3: "Quiche Lecraine",
  };
  const ingredients: MyIngredient[] = [
    {
      id: 1111,
      name: "Apples",
      open: false,
      quantities: [
        {
          id: 1111,
          unit: "kg",
          value: 1,
          in_basket: true,
          recipe_id: null,
        },
      ],
    },
    {
      id: 222,
      name: "Leek",
      open: true,
      quantities: [
        {
          id: 1111,
          unit: "gram",
          value: 500,
          in_basket: false,
          recipe_id: 2,
        },
        {
          id: 2222,
          unit: "gram",
          value: 250,
          in_basket: false,
          recipe_id: 3,
        },
      ],
    },
    {
      id: 333,
      name: "Pear",
      open: false,
      quantities: [
        {
          id: 3333,
          unit: "count",
          value: 5,
          in_basket: false,
          recipe_id: null,
        },
      ],
    },
  ];

  return (
    <div className="content-grid">
      <ul className="grid gap-4 max-w-md">
        {ingredients.map((ingredient) => (
          <WorkingView ingredient={ingredient} allRecipes={recipes} />
        ))}
      </ul>
    </div>
  );
}
function WorkingView({
  ingredient,
  allRecipes,
}: {
  ingredient: MyIngredient;
  // Would be used once we expand the `quantities` per recipe
  allRecipes: Record<number, string>;
}) {
  const inBasket = ingredient.quantities.some((q) => q.in_basket);
  const [checked, setChecked] = useState(inBasket);

  const [open, setOpen] = useState(false);

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
        <ToggleButton onToggle={() => setOpen(b => !b)} open={open} />
      </div>
      {open && (
        <div>
          <hr className="h-0.5 my-2 bg-black border-0" />
          {ingredient.quantities.map((q) => (
            <div className={"flex flex-row"}>
              <span className={"w-5"} />
              <p className={"ml-2"}>
                {q.recipe_id ? allRecipes[q.recipe_id] || "Manual" : "Manual"}
              </p>
              <DottedLine />
              <p>{humanize(q)}</p>
              <span className={"w-7"} />
            </div>
          ))}
          <hr className="h-0.5 my-2 bg-black border-0" />
          <div className={"flex flex-row gap-2 justify-end"}>
            <button type={"button"} className={"px-2"}>
              Edit
            </button>
            <button type={"button"} className={"px-2 bg-black text-white"}>
              Delete
            </button>
            {/*<span className={"w-7"}/>*/}
          </div>
        </div>
      )}
    </li>
  );
}