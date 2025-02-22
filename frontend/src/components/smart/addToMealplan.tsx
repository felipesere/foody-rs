import {
  FloatingFocusManager,
  autoUpdate,
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
import { useAllMealPlans } from "../../apis/mealplans.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";

type ShoppinglistIdentifier = Pick<Shoppinglist, "id" | "name">;

type Props = {
  token: string;
  onSelect: (id: ShoppinglistIdentifier) => void;
  label?: string;
};

export function AddToMealPlan(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const label = props.label || "Add";

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
            <PickMealplan
              token={props.token}
              onSelect={(id) => {
                props.onSelect(id);
                setIsOpen(false);
              }}
            />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}

function PickMealplan(props: Props) {
  const { isLoading, data } = useAllMealPlans(props.token);

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const meal_plans = data.meal_plans.slice(0, 5);

  return (
    <ol className={"space-y-2"}>
      {meal_plans.map((list) => (
        <li key={list.id}>
          <button
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list);
            }}
            className={"px-2 bg-white shadow"}
          >
            {list.name}
          </button>
        </li>
      ))}
    </ol>
  );
}
