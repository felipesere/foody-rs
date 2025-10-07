import { useAllMealPlans } from "../../apis/mealplans.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { Popup } from "../popup.tsx";

type MealPlanIdentifier = Pick<Shoppinglist, "id" | "name">;

export type Props = {
  token: string;
  onSelect: (id: MealPlanIdentifier) => void;
  label?: string;
};

export function AddToMealPlan(props: Props) {
  const label = props.label || "Add";

  return (
    <Popup>
      <Popup.OpenButton label={label} />
      <Popup.Pane>
        <PickMealplan
          token={props.token}
          onSelect={(id) => {
            props.onSelect(id);
          }}
        />
      </Popup.Pane>
    </Popup>
  );
}

export function PickMealplan(props: Props) {
  const { isLoading, data } = useAllMealPlans(props.token);

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const meal_plans = data.meal_plans.slice(0, 5);

  return (
    <ol className={"space-y-2"}>
      {meal_plans.map((list) => (
        <li key={list.id}>
          <Popup.CloseButton
            label={list.name}
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list);
            }}
            className={"px-2 bg-white shadow"}
          />
        </li>
      ))}
    </ol>
  );
}
