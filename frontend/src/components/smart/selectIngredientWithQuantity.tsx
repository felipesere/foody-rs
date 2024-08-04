import classnames from "classnames";
import { useRef, useState } from "react";
import {
  type Ingredient,
  useCreateNewIngredient,
} from "../../apis/ingredients.ts";
import type { Quantity } from "../../apis/recipes.ts";
import { parse } from "../../quantities.ts";
import { FindIngredient } from "./findIngredient.tsx";

type SelectIngredientWithQuantityProps = {
  token: string;
  onIngredient: (i: Ingredient, q: Quantity) => void;
  className?: string;
};

export function SelectIngredientWithQuantity(
  props: SelectIngredientWithQuantityProps,
) {
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

  return (
    <div className={classnames(props.className, "flex flex-row")}>
      <FindIngredient
        token={props.token}
        placeholder={"ingredient..."}
        onIngredient={(v) => {
          setSelectedIngredient(v);
          setNewIngredientName(undefined);
        }}
        onNewIngredient={(v) => {
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
