import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Recipe, useAllRecipes } from "../apis/recipes.ts";
import { Button } from "../components/button.tsx";
import { Dropdown, type DropdownProps } from "../components/dropdown.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { KebabMenu } from "../components/kebabMenu.tsx";

export const Route = createFileRoute("/_auth/mealplan")({
  component: MealPlanPage,
});

function idOf(recipe: string | Recipe) {
  if (typeof recipe === "string") {
    return recipe;
  }
  return recipe.id;
}

function isRecipe(recipe: string | Recipe): recipe is Recipe {
  return (recipe as Recipe).id !== undefined;
}

function MealPlanPage() {
  const { token } = Route.useRouteContext();

  const [chosen, setChosen] = useState<(string | Recipe)[]>([]);

  return (
    <div className="content-grid space-y-4 max-w-md pb-20">
      <FieldSet legend={"Thing"}>
        <div className={"flex flex-col space-y-2"}>
          <Button
            classNames={"whitespace-nowrap flex-shrink"}
            label={"New meal plan"}
          />
          <div className={"flex flex-row gap-2"}>
            <p>Add recipe or thing</p>
            <FindRecipe
              token={token}
              placeholder={"Recipe..."}
              onRecipe={(r) => setChosen((previous) => [...previous, r])}
              onNonRecipe={(v) => setChosen((previous) => [...previous, v])}
            />
          </div>
        </div>
      </FieldSet>
      <p>Meals</p>
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
          {chosen.map((recipe) => (
            <tr key={idOf(recipe)}>
              <td className={"border-2 border-black text-left align-top pl-2"}>
                {isRecipe(recipe) ? (
                  <Link to={`/recipes/${recipe.id}/edit`}>{recipe.name}</Link>
                ) : (
                  recipe
                )}
              </td>
              <td
                className={"border-2 border-black text-left align-middle pl-2"}
              >
                <input type={"checkbox"} />
              </td>
              <td className={"border-2 border-black text-left my-auto pl-2"}>
                <KebabMenu>
                  <KebabMenu.Button
                    value={"Delete"}
                    onClick={() => {
                      setChosen((previous) =>
                        previous.filter((v) => v !== recipe),
                      );
                    }}
                    style={"dark"}
                  />
                </KebabMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
