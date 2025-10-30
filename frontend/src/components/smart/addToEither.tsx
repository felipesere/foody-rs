import { toast } from "sonner";
import { useAddRecipeToMealplan } from "../../apis/mealplans.ts";
import { addRecipeToShoppinglist, Recipe } from "../../apis/recipes.ts";
import { Divider } from "../divider.tsx";
import { Popup } from "../popup.tsx";
import { PickMealplan } from "./addToMealplan.tsx";
import { PickShoppinglist } from "./addToShoppinglist.tsx";

type Props = {
  recipeId: Recipe["id"];
  token: string;
};

export function AddtoEither(props: Props) {
  const recipeId = props.recipeId;
  const addRecipe = addRecipeToShoppinglist(props.token);
  const addMealToPlan = useAddRecipeToMealplan(props.token);

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
          token={props.token}
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
          token={props.token}
          onSelect={(mealPlan) => {
            addMealToPlan.mutate({
              mealPlan: mealPlan.id,
              details: {
                type: "from_recipe",
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
