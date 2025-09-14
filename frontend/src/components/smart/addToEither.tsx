import {
  autoUpdate,
  FloatingFocusManager,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddRecipeToMealplan } from "../../apis/mealplans.ts";
import { addRecipeToShoppinglist, Recipe } from "../../apis/recipes.ts";
import { Divider } from "../divider.tsx";
import { PickMealplan } from "./addToMealplan.tsx";
import { PickShoppinglist } from "./addToShoppinglist.tsx";

type Props = {
  recipeId: Recipe["id"];
  token: string;
};

export function AddtoEither(props: Props) {
  const recipeId = props.recipeId;
  const [isOpen, setIsOpen] = useState(false);
  const addRecipe = addRecipeToShoppinglist(props.token);
  const addMealToPlan = useAddRecipeToMealplan(props.token);

  const label = "Add";

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(3), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="submit"
        className="px-2 text-black bg-gray-300 shadow"
      >
        {label}
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={"bg-gray-200 p-2 border-solid border-black border-2"}
          >
            <p className={"pb-2 font-bold"}>Shoppinglist</p>
            <PickShoppinglist
              token={props.token}
              onSelect={(shoppinglist) => {
                addRecipe.mutate({ shoppinglistId: shoppinglist.id, recipeId });
                setIsOpen(false);
                toast.success(
                  `Added ${recipeId} to shopping list ${shoppinglist.name}`,
                );
              }}
            />
            <Divider />
            <p className={"pb-2 font-bold"}>Mealplans</p>
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
                setIsOpen(false);
                toast.success(`Added ${recipeId} to mealplan ${mealPlan.name}`);
              }}
            />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
