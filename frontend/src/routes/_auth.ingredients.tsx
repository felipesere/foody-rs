import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { z } from "zod";
import {
  type Ingredient,
  IngredientSchema,
  addIngredientToShoppinglist,
  useAllIngredients,
} from "../apis/ingredients.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";
import { AddToShoppinglist } from "../components/smart/addToShoppinglist.tsx";
import { SelectTags } from "../components/smart/selectTags.tsx";
import { ToggleButton } from "../components/toggle.tsx";
import { useScrollTo } from "../hooks/useScrollTo.ts";

const ingredientSearchSchema = z.object({
  ingredient: IngredientSchema.pick({ id: true }).optional(),
});

// type IngredientSearch = z.infer<typeof ingredientSearchSchema>;

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
  validateSearch: ingredientSearchSchema,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);
  const { ingredient } = Route.useSearch();
  let selectedIndex = undefined;
  if (ingredient?.id && ingredients) {
    selectedIndex = ingredients.findIndex((i) => i.id === ingredient.id);
  }
  const [selected, setSelected] = useState<number | undefined>(selectedIndex);

  useHotkeys(
    ["j", "k"],
    (_, hotkey) => {
      setSelected((previous) => {
        if (previous !== undefined) {
          const next = hotkey.keys?.includes("j") ? previous + 1 : previous - 1;
          return next % (ingredients?.length || 0);
        }
        return 0;
      });
    },
    {},
    [ingredients],
  );

  if (!ingredients) {
    return <p>Loading...</p>;
  }

  return (
    <div className="content-grid">
      <ul className="grid gap-4 max-w-md">
        {ingredients.map((ingredient, idx) => (
          <IngredientView
            key={ingredient.name}
            ingredient={ingredient}
            selected={idx === selected}
            token={token}
            onClick={() => setSelected(idx)}
          />
        ))}
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
  const [scrollToRef, setScrollTo] = useScrollTo<HTMLLIElement>();

  useEffect(() => {
    setScrollTo(props.selected);
  }, [setScrollTo, props.selected]);

  useHotkeys(
    "o",
    () => {
      if (props.selected) {
        setOpen((f) => !f);
      }
    },
    [props.selected],
  );

  const [isDirty, setIsDirty] = useState(false);
  const anyTags = props.ingredient.tags.length > 0;
  const addIngredient = addIngredientToShoppinglist(props.token);
  return (
    <li
      ref={scrollToRef}
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
            {anyTags ? (
              props.ingredient.tags.map((t) => <p key={t}>{t}</p>)
            ) : (
              <p>No Tags</p>
            )}
            {edit && (
              <SelectTags
                token={props.token}
                ingredientId={props.ingredient.id}
                currentTags={props.ingredient.tags}
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
