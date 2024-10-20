import { Link, createFileRoute } from "@tanstack/react-router";
import classNames from "classnames";
import { useState } from "react";
import {
  type Meal,
  type StoredMeal,
  useAddMealToPlan,
  useAllMealPlans,
  useClearMealplan,
  useDeleteMealFromMealPlan,
  useSetSectionOfMeal,
  useToggleMealIsCooked,
} from "../apis/mealplans.ts";
import { type Recipe, useAllRecipes } from "../apis/recipes.ts";
import { Button } from "../components/button.tsx";
import { Dropdown, type DropdownProps } from "../components/dropdown.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { KebabMenu } from "../components/kebabMenu.tsx";

export const Route = createFileRoute("/_auth/mealplan")({
  component: MealPlanPage,
});

function MealPlanPage() {
  const { token } = Route.useRouteContext();

  // TODO: figure out if I want one or many mealplans...
  const addMeal = useAddMealToPlan(token, 1);
  const clearPlan = useClearMealplan(token, 1);

  return (
    <div className="content-grid space-y-4 max-w-md pb-20">
      <FieldSet
        legend={"Thing"}
        className={{ fieldSet: "flex flex-col gap-2" }}
      >
        <Button
          classNames={"whitespace-nowrap flex-shrink"}
          label={"Clear"}
          onClick={() => {
            clearPlan.mutate();
          }}
        />
        <div className={"flex flex-row gap-2"}>
          <p>Add recipe or thing</p>
          <FindRecipe
            token={token}
            placeholder={"Recipe..."}
            onRecipe={(r) => {
              addMeal.mutate({
                section: null,
                details: {
                  type: "from_recipe",
                  id: r.id,
                },
              });
            }}
            onNonRecipe={(name) => {
              addMeal.mutate({
                section: null,
                details: {
                  type: "untracked",
                  name,
                },
              });
            }}
          />
        </div>
      </FieldSet>
      <MealPlan token={token} />
    </div>
  );
}

function MealPlan(props: { token: string }) {
  const all = useAllMealPlans(props.token);
  const recipes = useAllRecipes(props.token);

  if (all.isPending || recipes.isPending) {
    return "Loading...";
  }

  if (!all.data || !recipes.data) {
    return "No data?";
  }

  const fixedMealPlan = all.data.meal_plans[0];

  const sections = new Set(
    fixedMealPlan.meals.map((meal) => meal.section).filter((s) => s !== null),
  );

  const namedSection: Record<string, StoredMeal[]> = {};
  const unnamed: StoredMeal[] = [];

  for (const meal of fixedMealPlan.meals) {
    if (meal.section) {
      const meals = namedSection[meal.section] || [];
      meals.push(meal);
      namedSection[meal.section] = meals;
    } else {
      unnamed.push(meal);
    }
  }
  const names = Object.keys(namedSection);
  names.sort();

  return (
    <>
      <p>Meals</p>

      {unnamed.length > 0 && (
        <SectionOfMeals
          token={props.token}
          mealPlanId={1}
          meals={unnamed}
          sections={sections}
          recipes={recipes.data.recipes}
        />
      )}

      {names.map((title) => {
        const meals = namedSection[title];
        return (
          <SectionOfMeals
            key={title}
            token={props.token}
            mealPlanId={1}
            meals={meals}
            sections={sections}
            recipes={recipes.data.recipes}
            title={title}
          />
        );
      })}
    </>
  );
}

function NewSection(props: { onNewValue: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        props.onNewValue(value);
      }}
    >
      <input
        type={"text"}
        className={"border-2 border-solid border-black px-2"}
        placeholder={"New section..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

function SectionOfMeals(props: {
  token: string;
  title?: string;
  mealPlanId: number;
  meals: StoredMeal[];
  sections: Set<string>;
  recipes: Recipe[];
}) {
  const toggleIsCooked = useToggleMealIsCooked(props.token, props.mealPlanId);
  const deleteMeal = useDeleteMealFromMealPlan(props.token, props.mealPlanId);
  const setSection = useSetSectionOfMeal(props.token, props.mealPlanId);

  return (
    <>
      {props.title && <p>{props.title}</p>}
      <table className={"relative border-collapse"}>
        <thead>
          <tr>
            <th className={"border-2 border-black text-left align-top pl-2"}>
              Meal
            </th>
            <th className={"border-2 border-black text-left align-top pl-2"}>
              Cooked?
            </th>
            <th className="border-2 border-black text-left align-top pl-2" />
          </tr>
        </thead>
        <tbody>
          {props.meals.map((meal) => (
            <tr
              key={meal.id}
              className={classNames({
                "bg-gray-200 text-gray-500": meal.is_cooked,
              })}
            >
              <td className={"border-2 border-black text-left align-top pl-2"}>
                <MealLink details={meal.details} allRecipes={props.recipes} />
              </td>
              <td
                className={"border-2 border-black text-left align-middle pl-2"}
              >
                <input
                  type={"checkbox"}
                  defaultChecked={meal.is_cooked}
                  onClick={() =>
                    toggleIsCooked.mutate({
                      id: meal.id,
                      is_cooked: !meal.is_cooked,
                    })
                  }
                />
              </td>
              <td className={"border-2 border-black text-left my-auto pl-2"}>
                <KebabMenu>
                  <KebabMenu.Button
                    value={"Delete"}
                    onClick={() => deleteMeal.mutate({ id: meal.id })}
                    style={"dark"}
                  />
                  <KebabMenu.Divider />
                  {Array.from(props.sections).map((section) => (
                    <KebabMenu.Button
                      key={section}
                      value={section}
                      style={"plain"}
                      onClick={() =>
                        setSection.mutate({ id: meal.id, section })
                      }
                    />
                  ))}
                  <NewSection
                    onNewValue={(newSection) => {
                      setSection.mutate({ id: meal.id, section: newSection });
                    }}
                  />
                </KebabMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MealLink(props: { details: Meal["details"]; allRecipes: Recipe[] }) {
  if (props.details.type === "from_recipe") {
    const id = props.details.id;
    const name = props.allRecipes.find((r) => r.id === id)?.name || "Unknown";
    return <Link to={`/recipes/${id}`}>{name}</Link>;
  }
  return props.details.name;
}

type FindRecipeProps = {
  token: string;
  placeholder: string;
  onRecipe: DropdownProps<Recipe>["onSelectedItem"];
  onNonRecipe: DropdownProps<Recipe>["onNewItem"];
};

export function FindRecipe(props: FindRecipeProps) {
  const recipes = useAllRecipes(props.token);

  if (!recipes.data) {
    return null;
  }

  return (
    <Dropdown
      placeholder={props.placeholder}
      items={recipes.data.recipes}
      dropdownClassnames={"border-gray-500 border-solid border-2"}
      onSelectedItem={props.onRecipe}
      onNewItem={props.onNonRecipe}
    />
  );
}
