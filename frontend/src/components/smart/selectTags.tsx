import {
  Ingredient,
  useIngredientTags,
  useUpdateIngredient,
} from "../../api/v1/ingredient.ts";
import type { Shoppinglist } from "../../api/v1/shoppinglists.ts";
import { MultiSelect } from "../multiselect.tsx";

export function SelectTags(props: {
  ingredientId: Ingredient["id"];
  currentTags: string[];
  shoppinglistId?: Shoppinglist["id"];
}) {
  const tags = useIngredientTags();
  const updateIngredient = useUpdateIngredient();

  if (!tags.data) {
    return <p>Loading...</p>;
  }
  const knownTags = tags.data;
  return (
    <MultiSelect
      label={"Select tags"}
      selected={props.currentTags}
      items={knownTags.tags}
      onItemsSelected={(tags) => {
        updateIngredient.mutate({
          ingredient_id: props.ingredientId,
          fields: {
            tags,
          },
        });
      }}
      newItemPlaceholder={"New tag..."}
      onNewItem={(value) => {
        updateIngredient.mutate({
          ingredient_id: props.ingredientId,
          fields: {
            tags: [...props.currentTags, value],
          },
        });
      }}
    />
  );
}
