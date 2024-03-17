import { createFileRoute } from "@tanstack/react-router";
import { useAllIngredients, Ingredient } from "../apis/ingredients.ts";

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);

  console.log(ingredients)
  return (
    <div className="content-grid">
      <ul className="grid gap-4">
        {ingredients ? (
          ingredients.map((ingredient) => (
            <IngredientView key={ingredient.name} ingredient={ingredient} />
          ))
        ) : (
          <p>Loading</p>
        )}
      </ul>
    </div>
  );
}

type IngredientViewProps = Pick<Ingredient, "name">;
function IngredientView(props: { ingredient: IngredientViewProps }) {
  return (
    <li className="p-2 border-black border-solid border-2">
      <p className="font-black uppercase tracking-wider">
        {props.ingredient.name}
      </p>
    </li>
  );
}
