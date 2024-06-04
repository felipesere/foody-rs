import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
  type Ingredient,
  addIngredientToShoppinglist,
  useAllIngredients,
  useSetIngredientTags,
} from "../apis/ingredients.ts";
import { AddToShoppinglist } from "../components/addToShoppinglist.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { MultiSelect } from "../components/multiselect.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";
import { ToggleButton } from "../components/toggle.tsx";

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { data: ingredients } = useAllIngredients(token);
  const [selected, setSelected] = useState<number | undefined>(undefined);

  useHotkeys(
    "j",
    () => {
      setSelected((previous) => {
        if (previous !== undefined) {
          return (previous + 1) % (ingredients?.length || 0);
        }
        return 0;
      });
    },
    {},
    [ingredients],
  );

  useHotkeys(
    "k",
    () => {
      setSelected((previous) => {
        if (previous !== undefined) {
          return (previous - 1) % (ingredients?.length || 0);
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

  const uniqueTags = new Set<string>();
  for (const ingredient of ingredients) {
    for (const tag of ingredient.tags) {
      uniqueTags.add(tag);
    }
  }
  const tags = Array.from(uniqueTags);

  return (
    <div className="content-grid">
      <ul className="grid gap-4 max-w-md">
        {ingredients.map((ingredient, idx) => (
          <IngredientView
            key={ingredient.name}
            ingredient={ingredient}
            knownTags={tags}
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
  knownTags: string[];
  token: string;
  selected: boolean;
  onClick: () => void;
};
function IngredientView(props: IngredientViewProps) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [temporaryName, setTemporaryName] = useState<string>("");

  useHotkeys(
    "e",
    () => {
      if (open) {
        setEdit((f) => !f);
      }
    },
    [open],
  );

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
                knownTags={props.knownTags}
              />
            )}
          </div>
          <Divider />
          <ButtonGroup>
            <button
              onClick={() => {
                setEdit((e) => !e);
              }}
              type={"button"}
              className={classnames("px-2 text-black shadow", {
                "border-amber-400": edit,
              })}
            >
              Edit
            </button>
            <button
              onClick={() => {}}
              type={"button"}
              className={"px-2 text-black shadow"}
            >
              Reset
            </button>
          </ButtonGroup>
        </>
      )}
    </li>
  );
}

function SelectTags(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentTags: string[];
  knownTags: string[];
}) {
  const setTags = useSetIngredientTags(props.token, props.ingredientId);
  return (
    <MultiSelect
      label={"Select tags"}
      selected={props.currentTags}
      items={props.knownTags}
      onItemsSelected={(tags) => {
        setTags.mutate({ tags });
      }}
      newItemPlaceholder={"New tag..."}
      onNewItem={(value) => {
        setTags.mutate({ tags: [...props.currentTags, value] });
      }}
    />
  );
}
