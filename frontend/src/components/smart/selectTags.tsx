import {
  type Ingredient,
  useAllIngredientTags,
  useSetIngredientTags,
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
  const setTags = useSetIngredientTags(props.token, props.ingredientId);

  if (!tags.data) {
    return <p>Loading...</p>;
  }
  const knownTags = tags.data.tags;
  return (
    <MultiSelect
      label={"Select tags"}
      selected={props.currentTags}
      items={knownTags}
      onItemsSelected={(tags) => {
        setTags.mutate({ tags });
      }}
      newItemPlaceholder={"New tag..."}
      onNewItem={(value) => {
        setTags.mutate({ tags: [...props.currentTags, value] });
      }}
    />
  );
}
