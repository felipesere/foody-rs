import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { MultiSelect } from "../multiselect.tsx";
import { client, Ingredient } from "../../api/v1/ingredient.ts";

export function SelectTags(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentTags: string[];
  shoppinglistId?: Shoppinglist["id"];
}) {
  const tags = client().tags(props.token);
  const updateIngredient = client().update(props.token);

  console.log(tags);

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
