import { useAllAisles } from "../../apis/aisles.ts";
import {
  type Ingredient,
  useSetIngredientAisle,
} from "../../apis/ingredients.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { SingleSelect } from "../singleselect.tsx";

export function SelectAisle(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentAisle: string | null;
  shoppinglistId?: Shoppinglist["id"];
}) {
  const aisles = useAllAisles(props.token);
  const setAisle = useSetIngredientAisle(props.token, props.ingredientId);

  if (!aisles.data || aisles.error) {
    return <p>Loading...</p>;
  }

  return (
    <SingleSelect
      label={"Select aisle"}
      items={aisles.data.map((a) => a.name)}
      selected={props.currentAisle}
      onItemsSelected={(item) => setAisle.mutate({ aisle: item })}
    />
  );
}
