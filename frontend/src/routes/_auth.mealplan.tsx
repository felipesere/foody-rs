import { createFileRoute } from "@tanstack/react-router";
import { type Recipe, useAllRecipes } from "../apis/recipes.ts";
import { Dropdown, type DropdownProps } from "../components/dropdown.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { useState } from "react";

export const Route = createFileRoute("/_auth/mealplan")({
  component: MealPlanPage,
});

function MealPlanPage() {
  const { token } = Route.useRouteContext();

  const [chosen, setChosen] = useState<(string | Recipe)[]>([]);

  return (
    <div className="content-grid space-y-4 max-w-md pb-20">
      <FieldSet legend={"Add recipe"}>
        <FindRecipe
          token={token}
          placeholder={"Recipes"}
          onRecipe={(r) => setChosen((previous) => [...previous, r.name])}
          onNonRecipe={(v) => setChosen((previous) => [...previous, v])}
        />
      </FieldSet>
      <p>Meals</p>
      <ul>
        {chosen.map((recipe) => (
          <li>
            <MealItem item={recipe} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MealItem(props: { item: string | Recipe }) {
  if (typeof props.item === "string") {
    return <p>{props.item}</p>;
  }
  return (
    <div>
      <p>{props.item.name}</p>
      <ol>
        {props.item.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ol>
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
