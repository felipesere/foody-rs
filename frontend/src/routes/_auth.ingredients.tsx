import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  addIngredientToShoppinglist,
  type Ingredient,
  IngredientSchema,
  useAllIngredients,
} from "../apis/ingredients.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";
import { AddToShoppinglist } from "../components/smart/addToShoppinglist.tsx";
import { SelectAisle } from "../components/smart/selectAisle.tsx";
import { SelectTags } from "../components/smart/selectTags.tsx";
import { ToggleButton } from "../components/toggle.tsx";
import { orderByTag } from "../domain/orderByTag.ts";

const ingredientSearchSchema = z.object({
  ingredient: IngredientSchema.pick({ id: true }).optional(),
});

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
  validateSearch: ingredientSearchSchema,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);

  if (!ingredients) {
    return <p>Loading...</p>;
  }

  const sections = orderByTag(ingredients);
  sections.sort((a, b) => a.items.length - b.items.length);

  return (
    <div className="content-grid">
      <ul className="gap-4 columns-xs space-y-10">
        {sections.map((section) => {
          return (
            <div key={section.name} className={"flex flex-col"}>
              <p className={"font-black"}>{section.name}</p>
              <ol className="space-y-2">
                {section.items.map((ingredient) => {
                  return (
                    <IngredientView
                      key={ingredient.name}
                      ingredient={ingredient}
                      selected={false}
                      token={token}
                      onClick={() => {}}
                    />
                  );
                })}
              </ol>
            </div>
          );
        })}
      </ul>
    </div>
  );
}

type IngredientViewProps = {
  ingredient: Ingredient;
  token: string;
  selected: boolean;
  onClick: () => void;
};
function IngredientView(props: IngredientViewProps) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [temporaryName, setTemporaryName] = useState<string>("");

  const [isDirty, setIsDirty] = useState(false);
  const anyTags = props.ingredient.tags.length > 0;
  const addIngredient = addIngredientToShoppinglist(props.token);
  return (
    <li
      className={classnames("p-2 border-solid border-2", {
        "border-black": !props.selected,
        "border-yellow-400": props.selected,
      })}
    >
      <div
        onClick={props.onClick}
        className={"flex flex-row gap-1 font-black align-middle"}
      >
        <ToggleButton
          onToggle={() => {
            if (open) {
              setEdit(false);
            }
            setOpen((b) => !b);
          }}
          open={open}
        />
        <ResizingInput
          readOnly={!edit}
          name={"ingredient"}
          boxClassName={"flex-grow"}
          className={"uppercase tracking-wider"}
          onChange={(v) => {
            setTemporaryName(v.target.value);
            setIsDirty(true);
          }}
          value={isDirty ? temporaryName : props.ingredient.name}
        />
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
      {open && (
        <>
          <Divider />
          <div className={"flex flex-row gap-4"}>
            <p>Tags:</p>
            {anyTags
              ? props.ingredient.tags.map((t) => <p key={t}>{t}</p>)
              : "None"}
            {edit && (
              <SelectTags
                token={props.token}
                ingredientId={props.ingredient.id}
                currentTags={props.ingredient.tags}
              />
            )}
          </div>
          <Divider />
          <div className={"flex flex-row gap-4"}>
            <p>Aisle:</p>
            {props.ingredient.aisle?.name || "None"}
            {edit && (
              <SelectAisle
                token={props.token}
                ingredientId={props.ingredient.id}
                currentAisle={props.ingredient.aisle?.name ?? null}
              />
            )}
          </div>
          <Divider />
          <ButtonGroup>
            <Button
              label={"Edit"}
              hotkey={"ctrl+e"}
              onClick={() => {
                setEdit((e) => !e);
              }}
              type={"button"}
              classNames={{ "border-amber-400": edit }}
            />
            <Button
              label={"Reset"}
              hotkey={"ctrl+r"}
              type="button"
              onClick={() => {}}
            />
          </ButtonGroup>
        </>
      )}
    </li>
  );
}
