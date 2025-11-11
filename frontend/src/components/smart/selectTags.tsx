import {
  type Ingredient,
  useAllIngredientTags,
  useEditIngredient,
} from "../../apis/ingredients.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { MultiSelect } from "../multiselect.tsx";

export function SelectTags(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentTags: string[];
  shoppinglistId?: Shoppinglist["id"];
}) {
  const tags = useAllIngredientTags(props.token);
  const editIngredient = useEditIngredient(props.token);

  if (!tags.data) {
    return <p>Loading...</p>;
  }
  const knownTags = tags.data;
  return (
    <MultiSelect
      label={"Select tags"}
      selected={props.currentTags}
      items={knownTags}
      onItemsSelected={(tags) => {
        console.log(tags);
        editIngredient.mutate({
          id: props.ingredientId,
          changes: [{ type: "tags", value: tags }],
        });
      }}
      newItemPlaceholder={"New tag..."}
      onNewItem={(value) => {
        editIngredient.mutate({
          id: props.ingredientId,
          changes: [{ type: "tags", value: [...props.currentTags, value] }],
        });
      }}
    />
  );
}
