import { type Ingredient, useIngredients } from "../../api/v1/ingredient.ts";
import type { DropdownProps } from "../dropdown.tsx";
import { Dropdown } from "../dropdown.tsx";

type FindIngredientProps = {
  placeholder: string;
  onIngredient: DropdownProps<Ingredient>["onSelectedItem"];
  onNewIngredient?: DropdownProps<Ingredient>["onNewItem"];
  ref?: DropdownProps<Ingredient>["ref"];
};

export function FindIngredient(props: FindIngredientProps) {
  const ingredients = useIngredients();

  if (!ingredients.data) {
    return null;
  }

  const extraProps = {
    ...(props.onNewIngredient ? { onNewItem: props.onNewIngredient } : {}),
    ...(props.ref ? { ref: props.ref } : {}),
  };

  return (
    <Dropdown
      placeholder={props.placeholder}
      items={ingredients.data.ingredients}
      dropdownClassnames={"border-gray-500 border-solid border-2"}
      onSelectedItem={props.onIngredient}
      {...extraProps}
    />
  );
}
