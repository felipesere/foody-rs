import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Ingredient,
  addIngredientToShoppinglist,
  useAllIngredients,
} from "../apis/ingredients.ts";
import { AddToShoppinglist } from "../components/addToShoppinglist.tsx";
import { Divider } from "../components/divider.tsx";
import { ToggleButton } from "../components/toggle.tsx";

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);

  return (
    <div className="content-grid">
      <ul className="grid gap-4 max-w-md">
        {ingredients ? (
          ingredients.map((ingredient) => (
            <IngredientView
              key={ingredient.name}
              ingredient={ingredient}
              token={token}
            />
          ))
        ) : (
          <p>Loading</p>
        )}
      </ul>
    </div>
  );
}

type IngredientViewProps = {
  ingredient: Ingredient;
  token: string;
};
function IngredientView(props: IngredientViewProps) {
  const [open, setOpen] = useState(false);

  const addIngredient = addIngredientToShoppinglist(props.token);
  return (
    <li className="border-black border-solid border-2">
      <div className={"flex flex-row justify-between p-2"}>
        <p className="font-black uppercase tracking-wider">
          {props.ingredient.name}
        </p>
        <ToggleButton onToggle={() => setOpen((b) => !b)} open={open} />
      </div>
      {open && (
        <div className={"flex flex-row justify-between p-2"}>
          <Divider />
          <AddToShoppinglist
            token={props.token}
            onSelect={(shoppinglist) => {
              addIngredient.mutate({
                shoppinglistId: shoppinglist.id,
                ingredient: props.ingredient.name,
                quantity: [
                  {
                    unit: "count",
                    value: 1,
                  },
                ],
              });
              toast(
                `Added "${props.ingredient.name}" to shoppinglist "${shoppinglist.name}"`,
              );
            }}
          />
        </div>
      )}
    </li>
  );
}
