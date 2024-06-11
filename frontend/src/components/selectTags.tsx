import { type Ingredient, useSetIngredientTags } from "../apis/ingredients.ts";
import type { Shoppinglist } from "../apis/shoppinglists.ts";
import { MultiSelect } from "./multiselect.tsx";

export function SelectTags(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentTags: string[];
  knownTags: string[];
  shoppinglistId?: Shoppinglist["id"];
}) {
  const setTags = useSetIngredientTags(props.token, props.ingredientId);
  return (
    <MultiSelect
      label={"Select tags"}
      selected={props.currentTags}
      items={props.knownTags}
      onItemsSelected={(tags) => {
        setTags.mutate({ tags });
      }}
      newItemPlaceholder={"New tag..."}
      onNewItem={(value) => {
        setTags.mutate({ tags: [...props.currentTags, value] });
      }}
      hotkey={"ctrl+t"}
    />
  );
}
