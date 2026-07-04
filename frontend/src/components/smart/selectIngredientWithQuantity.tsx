import classnames from "classnames";
import { useRef, useState } from "react";
import {
  type Ingredient,
  useCreateIngredient,
} from "../../api/v1/ingredient.ts";
import { parse } from "../../quantities.ts";
import { FindIngredient } from "./findIngredient.tsx";
import { Quantity } from "../../api/v1/shoppinglists.ts";

export type SelectIngredientWithQuantityProps = {
  onIngredient: (i: Ingredient, q: Quantity, raw: string) => void;
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

  const newIngredient = useCreateIngredient();

  const ingredientRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={classnames(props.className, "flex flex-wrap gap-1ch")}>
      <FindIngredient
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
        className={"border-gray-500 border-solid border-2"}
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
        className={"px-1ch"}
        type={"button"}
        disabled={!((selectedIngredient || newIngredientName) && quantity)}
        onClick={() => {
          if (quantity === undefined) {
            return;
          }

          if (selectedIngredient) {
            props.onIngredient(
              selectedIngredient,
              quantity.quantity,
              quantity.raw,
            );
          }

          if (newIngredientName) {
            newIngredient
              .mutateAsync({
                name: newIngredientName,
                tags: [],
              })
              .then((ingredient) => {
                props.onIngredient(ingredient, quantity.quantity, quantity.raw);
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
