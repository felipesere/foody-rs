import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Ingredient,
  addIngredientToShoppinglist,
  useAllIngredients,
} from "../apis/ingredients.ts";
import { AddToShoppinglist } from "../components/addToShoppinglist.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { ToggleButton } from "../components/toggle.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);

  if (!ingredients) {
    return <p>Loading...</p>;
  }

  return (
    <div className="content-grid">
      <ul className="grid gap-4 max-w-md">
        {ingredients.map((ingredient) => (
          <IngredientView
            key={ingredient.name}
            ingredient={ingredient}
            token={token}
          />
        ))}
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
  const [edit, setEdit] = useState(false);
  const [temporaryName, setTemporaryName] = useState<string | undefined>(
    undefined,
  );

  const [newTag, setNewTag] = useState<string | undefined>(undefined);

  const addIngredient = addIngredientToShoppinglist(props.token);
  return (
    <li className="p-2 border-black border-solid border-2">
      <div className={"flex flex-row justify-between font-black align-middle"}>
        {edit ? (
          <>
            <ResizingInput
              name={"ingredient"}
              boxClassName={"flex-grow"}
              className={"uppercase tracking-wider"}
              onChange={(v) => setTemporaryName(v.target.value)}
              value={temporaryName || props.ingredient.name || ""}
            />
            <ChangeTag
              token={props.token}
              currentTag={newTag || "Veg"}
              onChangeTag={(tag) => setNewTag(tag)}
            />
          </>
        ) : (
          <>
            <p
              onClick={() => setOpen(true)}
              className="flex-grow uppercase tracking-wider"
            >
              {props.ingredient.name}
            </p>
            <p className={"text-xs text-gray-700 font-light"}>Veg.</p>
          </>
        )}
        <ToggleButton onToggle={() => setOpen((b) => !b)} open={open} />
      </div>
      {open && (
        <>
          <Divider />
          <ButtonGroup>
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
            <button
              onClick={() => {
                setEdit((e) => !e);
              }}
              type={"button"}
              className={"px-2 text-black shadow"}
            >
              Edit
            </button>
          </ButtonGroup>
        </>
      )}
    </li>
  );
}

function ChangeTag(props: {
  token: string;
  currentTag: string;
  onChangeTag: (v: string) => void;
}) {
  const tags = useTags(props.token);

  return (
    <select name="tags" id="tags">
      {tags.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );
}
