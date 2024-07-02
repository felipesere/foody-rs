import classnames from "classnames";
import { useRef, useState } from "react";
import {
  type Ingredient,
  useAllIngredients,
  useCreateNewIngredient,
} from "../apis/ingredients.ts";
import type { Quantity } from "../apis/recipes.ts";
import { parse } from "../quantities.ts";
import { Dropdown } from "./dropdown.tsx";

// TODO: refactor this to be a pure "finding component"!
export function FindIngredient(props: {
  token: string;
  onIngredient: (i: Ingredient, q: Quantity) => void;
  className?: string;
}) {
  const ingredients = useAllIngredients(props.token);

  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);

  const [newIngredientName, setNewIngredientName] = useState<
    string | undefined
  >(undefined);

  const [quantity, setQuantity] = useState<
    | {
        raw: string;
        quantity: Quantity;
      }
    | undefined
  >(undefined);

  const newIngredient = useCreateNewIngredient(props.token);

  const ingredientRef = useRef<HTMLInputElement | null>(null);

  if (!ingredients.data) {
    return null;
  }

  return (
    <div className={classnames(props.className, "flex flex-row")}>
      <Dropdown
        placeholder={"ingredients..."}
        items={ingredients.data}
        dropdownClassnames={"border-gray-500 border-solid border-2"}
        onSelectedItem={(v) => {
          setSelectedIngredient(v);
          setNewIngredientName(undefined);
        }}
        onNewItem={(v) => {
          setSelectedIngredient(undefined);
          setNewIngredientName(v);
        }}
        ref={ingredientRef}
      />
      <input
        className={"ml-2 w-1/3 border-gray-500 border-solid border-2"}
        type={"text"}
        name={"new_quantity"}
        data-testid="new-quantity"
        placeholder={"e.g. 200g"}
        value={quantity?.raw || ""}
        onChange={(e) => {
          const raw = e.target.value;
          const quantity = parse(raw);
          setQuantity({
            raw,
            quantity,
          });
        }}
      />
      <button
        className={"ml-2 px-2"}
        type={"button"}
        disabled={!((selectedIngredient || newIngredientName) && quantity)}
        onClick={() => {
          if (quantity === undefined) {
            return;
          }

          if (selectedIngredient) {
            props.onIngredient(selectedIngredient, quantity.quantity);
          }

          if (newIngredientName) {
            console.log(newIngredientName);
            newIngredient
              .mutateAsync({
                name: newIngredientName,
                tags: [],
              })
              .then((ingredient) => {
                props.onIngredient(ingredient, quantity.quantity);
              });
          }

          setQuantity(undefined);
          ingredientRef.current?.focus();
        }}
      >
        Add
      </button>
    </div>
  );
}
