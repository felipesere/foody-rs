import { useAllIngredients } from "../apis/ingredients.ts";
import { Dropdown } from "./dropdown.tsx";

export function FindIngredient(props: { token: string }) {
  const ingredients = useAllIngredients(props.token);

  if (!ingredients.data) {
    return null;
  }

  // Not quite sure how to deal with callbacks here... or maybe refs?

  return (
    <div className={"flex flex-row w-fit justify-center self-center"}>
      <label className={"no-wrap"}>Add ingredient</label>
      <Dropdown items={ingredients.data} field={"name"} />
      <input type={"text"} name={"quantity"} placeholder={"1x"} />
      <button className={"p-2"} type={"button"}>
        Add
      </button>
    </div>
  );
}
