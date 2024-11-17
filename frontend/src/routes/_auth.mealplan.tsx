import { type FieldApi, useForm } from "@tanstack/react-form";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import classNames from "classnames";
import { useState } from "react";
import { z } from "zod";
import {
  type Meal,
  type MealPlan,
  type StoredMeal,
  useAddMealToPlan,
  useAddPlanToShoppinglist,
  useAllMealPlans,
  useClearMealplan,
  useCreateMealPlan,
  useDeleteMealFromMealPlan,
  useRemoveMealplan,
  useSetSectionOfMeal,
  useToggleMealIsCooked,
} from "../apis/mealplans.ts";
import { type Recipe, useAllRecipes } from "../apis/recipes.ts";
import { Button } from "../components/button.tsx";
import { Dropdown, type DropdownProps } from "../components/dropdown.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { KebabMenu } from "../components/kebabMenu.tsx";
import { AddToShoppinglist } from "../components/smart/addToShoppinglist.tsx";
import { Toggle } from "../components/toggle.tsx";

const SelectedMealPlanSchema = z.object({
  mealPlan: z.number().optional(),
});

export const Route = createFileRoute("/_auth/mealplan")({
  component: MealPlanPage,
  validateSearch: SelectedMealPlanSchema,
});

function MealPlanPage() {
  const { token } = Route.useRouteContext();
  const search = Route.useSearch();

  const all = useAllMealPlans(token);
  const recipes = useAllRecipes(token);
  const remove = useRemoveMealplan(token);

  if (all.isPending || recipes.isPending) {
    return "Loading...";
  }

  if (!all.data || !recipes.data) {
    return "No data?";
  }

  const selected =
    all.data.meal_plans.find((plan) => plan.id === search.mealPlan) ||
    all.data.meal_plans[0];

  return (
    <div className="content-grid gap-2 pb-20">
      <div className={"grid gap-4 grid-cols-1 sm:grid-cols-2"}>
        {/* left or top */}
        <div className={"space-y-4"}>
          <Toggle buttonLabel={"New Meal Plan"}>
            <NewMealPlan token={token} />
          </Toggle>
          <ViewMealPlan
            token={token}
            mealPlan={selected}
            recipes={recipes.data.recipes}
          />
        </div>
        {/* right or bottom */}
        <div className={"divider"}>
          <ol>
            {all.data.meal_plans.map((mealPlan: MealPlan) => (
              <li key={mealPlan.id}>
                <div className={"flex flex-row justify-between"}>
                  <Link
                    to={"/mealplan"}
                    search={{
                      mealPlan: mealPlan.id,
                    }}
                  >
                    {selected && selected.id === mealPlan.id && "* "}
                    {mealPlan.name}
                  </Link>
                  <Button
                    label={"Remove"}
                    onClick={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      remove.mutate({ id: mealPlan.id });
                    }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ViewMealPlan(props: {
  token: string;
  mealPlan: MealPlan;
  recipes: Recipe[];
}) {
  const { mealPlan, token, recipes } = props;

  const addMeal = useAddMealToPlan(token, mealPlan.id);
  const clearPlan = useClearMealplan(token, mealPlan.id);
  const addToShoppinglist = useAddPlanToShoppinglist(token, mealPlan.id);

  const sections = new Set(
    mealPlan.meals.map((meal) => meal.section).filter((s) => s !== null),
  );

  const namedSection: Record<string, StoredMeal[]> = {};
  const unnamed: StoredMeal[] = [];

  for (const meal of mealPlan.meals) {
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
      <FieldSet
        legend={mealPlan.name}
        className={{ fieldSet: "flex flex-col items-start gap-2" }}
      >
        <div className={"flex flex-row gap-2"}>
          <Button
            classNames={"whitespace-nowrap flex-shrink"}
            label={"Clear"}
            onClick={() => {
              clearPlan.mutate();
            }}
          />
          <AddToShoppinglist
            label={"Add to Shoppinglist"}
            token={props.token}
            onSelect={(list) => {
              addToShoppinglist.mutate({ shoppinglist: list.id });
            }}
          />
        </div>
        <div className={"flex flex-row gap-2"}>
          <p>Add recipe or thing</p>
          <FindRecipe
            token={props.token}
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
      <p>Meals</p>

      {unnamed.length > 0 && (
        <SectionOfMeals
          token={token}
          mealPlanId={mealPlan.id}
          meals={unnamed}
          sections={sections}
          recipes={recipes}
        />
      )}

      {names.map((title) => {
        const meals = namedSection[title];
        return (
          <SectionOfMeals
            key={title}
            token={token}
            mealPlanId={mealPlan.id}
            meals={meals}
            sections={sections}
            recipes={recipes}
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
      <table className={"table-fixed w-full border-collapse"}>
        <thead>
          <tr>
            <th className={"border-2 border-black text-left align-top pl-2"}>
              Meal
            </th>
            <th
              className={"border-2 border-black w-24 text-left align-top pl-2"}
            >
              Cooked?
            </th>
            <th className="border-2 border-black w-8 text-left align-top pl-2" />
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

// WARN: Stolen from `NewShoppinglist`
// @ts-ignore We are bringingin this back in just a minute!
function NewMealPlan(props: { token: string }) {
  const createNewShoppinglist = useCreateMealPlan(props.token);
  const navigate = useNavigate({ from: "/mealplan" });

  const defaultName = new Date().toISOString().split("T")[0];
  const form = useForm({
    defaultValues: {
      name: defaultName,
      keepUncooked: true,
    },
    onSubmit: async ({ value }) => {
      const newMeal = await createNewShoppinglist.mutateAsync(value);
      void form.reset();
      await navigate({ to: "/mealplan", search: { mealPlan: newMeal.id } });
    },
    validatorAdapter: zodValidator(),
  });
  return (
    <form
      className={"space-y-2"}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className={"flex flex-row"}>
        <form.Field
          name={"name"}
          validators={{
            onBlur: z.string().min(1),
          }}
          children={(field) => (
            <>
              <input
                type={"text"}
                className={"p-2 outline-0 border-black border-2 border-solid"}
                name={field.name}
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </>
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => (
            <button
              className={"px-2 ml-2 bg-gray-300 shadow"}
              type={"submit"}
              id={"submit"}
              disabled={!canSubmit}
            >
              Create
            </button>
          )}
        />
      </div>

      <form.Field
        name={"keepUncooked"}
        children={(field) => (
          <div className={"flex flex-row"}>
            <input
              id={"keepUncooked"}
              type={"checkbox"}
              className={"px-2 bg-white shadow"}
              checked={field.state.value}
              onChange={() => field.handleChange(!field.state.value)}
            />
            <label className={"no-colon ml-2"} htmlFor={"groupByAisle"}>
              Keep previous uncooked items
            </label>
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
