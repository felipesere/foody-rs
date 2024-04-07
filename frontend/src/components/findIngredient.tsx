import { useState } from "react";
import { type Ingredient, useAllIngredients } from "../apis/ingredients.ts";
import { Dropdown } from "./dropdown.tsx";

export function FindIngredient(props: { token: string }) {
  const ingredients = useAllIngredients(props.token);

  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >(undefined);
  const [quantity, setQuantity] = useState("");

  if (!ingredients.data) {
    return null;
  }

  return (
    <div className={"flex flex-row"}>
      <Dropdown
        items={ingredients.data}
        field={"name"}
        dropdownClassnames={"border-gray-500 border-solid border-2"}
        onSelectedItem={setSelectedIngredient}
      />
      <input
        className={"ml-2 w-1/3 border-gray-500 border-solid border-2"}
        type={"text"}
        name={"quantity"}
        placeholder={"1x"}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <button
        className={"ml-2 px-2"}
        type={"button"}
        onClick={() => {
          if (selectedIngredient && quantity) {
            console.log(
              `About to add ${selectedIngredient.name} @ ${quantity}`,
            );
          }
        }}
      >
        Add
      </button>
    </div>
  );
}
