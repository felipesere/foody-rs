import { type Ingredient, useAllIngredients } from "../apis/ingredients.ts";
import { Dropdown } from "./dropdown.tsx";

type FindIngredientProps = {
  token: string;
  placeholder: string;
  onIngredient: (i: Ingredient) => void;
};

export function FindIngredient(props: FindIngredientProps) {
  const ingredients = useAllIngredients(props.token);

  if (!ingredients.data) {
    return <p>Loading</p>;
  }

  return (
    <Dropdown
      placeholder={props.placeholder}
      items={ingredients.data}
      dropdownClassnames={"border-gray-500 border-solid border-2"}
      onSelectedItem={props.onIngredient}
    />
  );
}
