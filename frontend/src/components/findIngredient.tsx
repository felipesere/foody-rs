import { useAllIngredients } from "../apis/ingredients.ts";
import { Dropdown } from "./dropdown.tsx";

export function FindIngredient(props: { token: string }) {
  const ingredients = useAllIngredients(props.token);

  if (!ingredients.data) {
    return null;
  }

  return (
    <div className={"flex flex-row"}>
      <Dropdown
        items={ingredients.data}
        field={"name"}
        dropdownClassnames={"border-gray-500 border-solid border-2"}
      />
      <input
        className={"ml-2 w-1/3 border-gray-500 border-solid border-2"}
        type={"text"}
        name={"quantity"}
        placeholder={"1x"}
      />
      <button className={"ml-2 px-2"} type={"button"}>
        Add
      </button>
    </div>
  );
}
