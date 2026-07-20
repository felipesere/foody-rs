import { toast } from "sonner";
import { useAddMeal } from "../../api/v1/mealplans.ts";
import type { Recipe } from "../../api/v1/recipes.ts";
import { useAddRecipe } from "../../api/v1/shoppinglists.ts";
import { Divider } from "../divider.tsx";
import { Popup } from "../popup.tsx";
import { PickMealplan } from "./addToMealplan.tsx";
import { PickShoppinglist } from "./addToShoppinglist.tsx";

type Props = {
  recipeId: Recipe["id"];
};

export function AddtoEither(props: Props) {
  const recipeId = props.recipeId;
  const addRecipe = useAddRecipe();
  const addMealToPlan = useAddMeal();

  const label = "Add";

  return (
    <Popup>
      <Popup.OpenButton
        label={label}
        className="px-2ch text-black bg-gray-300 shadow"
      />
      <Popup.Pane>
        <p className={"pb-1lh font-bold"}>Shoppinglist</p>
        <PickShoppinglist
          onSelect={(shoppinglist) => {
            addRecipe.mutate({ shoppinglistId: shoppinglist.id, recipeId });
            toast.success(
              `Added ${recipeId} to shopping list ${shoppinglist.name}`,
            );
          }}
        />
        <Divider />
        <p className={"pb-1lh font-bold"}>Mealplans</p>
        <PickMealplan
          onSelect={(mealPlan) => {
            addMealToPlan.mutate({
              mealplanId: mealPlan.id,
              details: {
                kind: "from_recipe",
                id: props.recipeId,
              },
            });
            toast.success(`Added ${recipeId} to mealplan ${mealPlan.name}`);
          }}
        />
      </Popup.Pane>
    </Popup>
  );
}
