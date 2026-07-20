import { type Mealplan, useMealplans } from "../../api/v1/mealplans.ts";
import { Popup } from "../popup.tsx";

type MealPlanIdentifier = Pick<Mealplan, "id" | "name">;

export type Props = {
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
          onSelect={(id) => {
            props.onSelect(id);
          }}
        />
      </Popup.Pane>
    </Popup>
  );
}

export function PickMealplan(props: Props) {
  const { isLoading, data } = useMealplans();

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const meal_plans = data.mealplans.slice(0, 5);

  return (
    <ol className={"space-y-1lh"}>
      {meal_plans.map((list) => (
        <li key={list.id}>
          <Popup.CloseButton
            label={list.name}
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list);
            }}
            className={"px-2ch bg-white shadow"}
          />
        </li>
      ))}
    </ol>
  );
}
