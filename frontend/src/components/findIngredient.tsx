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
}) {
  const ingredients = useAllIngredients(props.token);

  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);

  const [newIngredientName, setNewIngredientName] = useState<
    string | undefined
  >(undefined);

  const [quantity, setQuantity] = useState<{
    raw: string;
    quantity: Quantity | undefined;
  }>({
    raw: "",
    quantity: undefined,
  });

  const newIngredient = useCreateNewIngredient(props.token);

  const ingredientRef = useRef<HTMLInputElement | null>(null);

  if (!ingredients.data) {
    return null;
  }

  return (
    <div className={"flex flex-row"}>
      <Dropdown
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
        name={"quantity"}
        placeholder={"e.g. 200g"}
        value={quantity.raw}
        onChange={(e) => {
          const value = e.target.value;
          setQuantity({
            raw: value,
            quantity: value ? parse(value) : undefined,
          });
        }}
      />
      <button
        className={"ml-2 px-2"}
        type={"button"}
        disabled={
          !((selectedIngredient || newIngredientName) && quantity.quantity)
        }
        onClick={() => {
          if (selectedIngredient && quantity.quantity) {
            props.onIngredient(selectedIngredient, quantity.quantity);
          }

          if (newIngredientName && quantity.quantity) {
            // strange... if I don't assign it then quantity can be `undefined`?
            const quant = quantity.quantity;
            newIngredient
              .mutateAsync({
                name: newIngredientName,
                tags: [],
              })
              .then((ingredient) => props.onIngredient(ingredient, quant));
          }

          setQuantity({
            raw: "",
            quantity: undefined,
          });
          ingredientRef.current?.focus();
        }}
      >
        Add
      </button>
    </div>
  );
}
