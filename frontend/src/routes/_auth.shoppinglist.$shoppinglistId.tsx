import { Link, createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { Fragment, useState } from "react";
import { addIngredientToShoppinglist } from "../apis/ingredients.ts";
import { type StoredQuantity, useAllRecipes } from "../apis/recipes.ts";
import {
  type Ingredient,
  type Shoppinglist,
  useRemoveIngredientFromShoppinglist,
  useRemoveQuantityFromShoppinglist,
  useSetNoteOnIngredient,
  useToggleIngredientInShoppinglist,
  useUpdateQuantityOnShoppinglist,
} from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { useAllTags } from "../apis/tags.ts";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteRowButton } from "../components/deleteRowButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { Editable } from "../components/editable.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
import { Progressbar } from "../components/progressbar.tsx";
import { SelectTags } from "../components/selectTags.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { orderByRecipe } from "../domain/orderByRecipe.ts";
import { type Section, orderByTags } from "../domain/tags.tsx";
import { combineQuantities, humanize, parse } from "../quantities.ts";
export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId")({
  component: ShoppingPage,
});

enum Grouping {
  None = "none",
  ByTag = "byTag",
  ByRecipe = "byRecipe",
}

function GroupingLabel(v: Grouping): string {
  switch (v) {
    case Grouping.None:
      return "None";
    case Grouping.ByTag:
      return "By Tag";
    case Grouping.ByRecipe:
      return "By Recipe";
  }
}

export function ShoppingPage() {
  const params = Route.useParams();
  const shoppinglistId = Number(params.shoppinglistId);
  const { token } = Route.useRouteContext();
  const shoppinglist = useShoppinglist(token, shoppinglistId);
  const recipes = useAllRecipes(token);
  const toggleIngredient = useToggleIngredientInShoppinglist(
    token,
    shoppinglistId,
  );
  const addIngredient = addIngredientToShoppinglist(token);
  const [grouping, setGrouping] = useState<Grouping>(Grouping.None);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const tags = useAllTags(token);

  if (shoppinglist.isLoading || !recipes.data || !tags.data) {
    return <p>Loading</p>;
  }

  if (shoppinglist.isError || recipes.isError) {
    return <p>Failed to load shoppinglist or recipes</p>;
  }

  const allRecipes =
    recipes.data.recipes.reduce(
      (acc, recipe) => {
        acc[recipe.id] = recipe.name;
        return acc;
      },
      {} as Record<number, string>,
    ) || {};

  let sections: Section[] = [];
  switch (grouping) {
    case "none":
    case "byTag":
      sections = orderByTags(shoppinglist.data?.ingredients || [], tags.data);
      break;
    case "byRecipe":
      sections = orderByRecipe(
        shoppinglist.data?.ingredients || [],
        allRecipes,
      );
      break;
  }

  const inBasket =
    shoppinglist.data?.ingredients.filter((i) =>
      i.quantities.some((q) => q.in_basket),
    ) || [];

  const fraction =
    (inBasket.length / (shoppinglist.data?.ingredients.length || 1)) * 100;

  return (
    <div className="content-grid space-y-4 max-w-md pb-20">
      <Toggle buttonLabel={"More..."}>
        <FieldSet legend={"Add ingredient"}>
          <FindIngredient
            token={token}
            onIngredient={(ingredient, quantity) => {
              addIngredient.mutate({
                shoppinglistId: shoppinglistId,
                ingredient: ingredient.name,
                quantity: [quantity],
              });
            }}
          />
        </FieldSet>
        <FieldSet
          legend={"Filter and Sort"}
          className={{ fieldSet: "mt-4 flex flex-col" }}
        >
          <div className={"flex flex-row gap-6"}>
            {Object.values(Grouping).map((option) => (
              <div key={option}>
                <input
                  type={"radio"}
                  name={"grouping"}
                  id={option}
                  value={option}
                  checked={option === grouping}
                  onChange={() => {
                    setGrouping(option);
                  }}
                />
                <label className={"no-colon pl-2"} htmlFor={option}>
                  {GroupingLabel(option)}
                </label>
              </div>
            ))}
          </div>
        </FieldSet>
        <div className={"p-2 flex flex-row gap-2"}>
          <input
            id={"groupByAisle"}
            type={"checkbox"}
            className={"px-2 bg-white shadow"}
            checked={showProgressBar}
            onChange={() => setShowProgressBar((b) => !b)}
          />
          <label className={"no-colon"} htmlFor={"groupByAisle"}>
            Show progress bar
          </label>
        </div>
      </Toggle>
      {showProgressBar && <Progressbar fraction={fraction} sticky={true} />}
      <ul className="grid max-w-md gap-4">
        {grouping === "none" &&
          shoppinglist.data?.ingredients.map((ingredient) => (
            <CompactIngredientView
              key={ingredient.name}
              token={token}
              shoppinglistId={shoppinglistId}
              ingredient={ingredient}
              allRecipes={allRecipes}
              onToggle={(ingredientId, inBasket) =>
                toggleIngredient.mutate({ ingredientId, inBasket })
              }
            />
          ))}
        {grouping !== "none" &&
          sections.map((section) => (
            <Fragment key={section.name}>
              <Divider className={"capitalize"} label={section.name} />
              {section.ingredients.map((ingredient) => (
                <CompactIngredientView
                  key={ingredient.name}
                  token={token}
                  shoppinglistId={shoppinglistId}
                  ingredient={ingredient}
                  allRecipes={allRecipes}
                  onToggle={(ingredientId, inBasket) =>
                    toggleIngredient.mutate({ ingredientId, inBasket })
                  }
                />
              ))}
            </Fragment>
          ))}
      </ul>
    </div>
  );
}

function CompactIngredientView({
  token,
  ingredient,
  shoppinglistId,
  onToggle,
  allRecipes,
}: {
  token: string;
  ingredient: Ingredient;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  onToggle: (ingredient: Ingredient["id"], inBasket: boolean) => void;
}) {
  const checked = ingredient.quantities.some((q) => q.in_basket);
  const [open, setOpen] = useState(false);
  return (
    <li
      className={classnames("border-black border-solid border-2 p-2", {
        "bg-gray-200 text-gray-500": checked,
      })}
    >
      <div
        className={classnames("flex flex-row", {
          "line-through": checked,
        })}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            onToggle(ingredient.id, !checked);
          }}
        />
        <p
          onClick={() => {
            onToggle(ingredient.id, !checked);
            // setChecked((checked) => !checked);
          }}
          className={classnames(
            "flex-grow inline capitalize ml-2 font-black tracking-wider",
          )}
        >
          {ingredient.name}
        </p>
        <p>{combineQuantities(ingredient.quantities)}</p>
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
      </div>
      {open && (
        <EditIngredient
          ingredient={ingredient}
          shoppinglistId={shoppinglistId}
          allRecipes={allRecipes}
          token={token}
        />
      )}
    </li>
  );
}

type EditIngredientProps = {
  ingredient: Ingredient;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  token: string;
};

type Changes = {
  removals: Array<StoredQuantity["id"]>;
  modifications: Array<{ value: string; quantity: StoredQuantity["id"] }>;
};

function EditIngredient({
  ingredient,
  token,
  shoppinglistId,
  allRecipes,
}: EditIngredientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState<string | undefined>(undefined);
  const useAddNote = useSetNoteOnIngredient(
    token,
    shoppinglistId,
    ingredient.id,
  );

  const [changes, setChanges] = useState<Changes>({
    removals: [],
    modifications: [],
  });
  const [modifiedIngredient, setModifiedIngredient] = useState(
    structuredClone(ingredient),
  );
  const deleteIngredient = useRemoveIngredientFromShoppinglist(
    token,
    shoppinglistId,
  );

  const removeQuantity = useRemoveQuantityFromShoppinglist(
    token,
    shoppinglistId,
  );
  const updateQuantity = useUpdateQuantityOnShoppinglist(token, shoppinglistId);

  function applyModifications(changesToIngredient: Changes) {
    for (const m of changesToIngredient.modifications) {
      updateQuantity.mutate({ id: m.quantity, rawQuantity: m.value });
    }

    for (const id of changesToIngredient.removals) {
      removeQuantity.mutate({ id });
    }
  }

  return (
    <div>
      <Divider />
      {(ingredient.note || newNote) && (
        <>
          <div className={"flex flex-row gap-2"}>
            <span>Note:</span>
            <Editable
              isEditing={isEditing}
              value={newNote || ingredient.note || ""}
              onBlur={(v) => {
                useAddNote.mutate({ note: v });
              }}
            />
          </div>
          <Divider />
        </>
      )}
      {ingredient.tags && (
        <>
          <div className={"flex flex-row gap-2"}>
            <Tags
              token={token}
              ingredientId={ingredient.id}
              tags={ingredient.tags}
              isEditing={isEditing}
            />
          </div>
          <Divider />
        </>
      )}
      {modifiedIngredient.quantities.map((quantity) => (
        <div key={quantity.id} className={"flex flex-row"}>
          <div className={"w-5"}>
            {isEditing ? (
              <DeleteRowButton
                className={"text-red-700"}
                onClick={() => {
                  setChanges((previous) => ({
                    ...previous,
                    removals: [...previous.removals, quantity.id],
                  }));
                  setModifiedIngredient((previous) => ({
                    ...previous,
                    quantities: previous.quantities.filter(
                      (q) => q.id !== quantity.id,
                    ),
                  }));
                }}
              />
            ) : null}
          </div>
          <p className={"ml-2"}>
            {quantity.recipe_id
              ? allRecipes[quantity.recipe_id] || "Manual"
              : "Manual"}
          </p>
          <DottedLine />
          <Editable
            isEditing={isEditing}
            value={humanize(quantity)}
            onBlur={(v) => {
              console.log(`Edited value: ${v}: ${JSON.stringify(parse(v))}`);
              setChanges((previous) => ({
                ...previous,
                modifications: [
                  ...previous.modifications,
                  { value: v, quantity: quantity.id },
                ],
              }));
              setModifiedIngredient((previous) => ({
                ...previous,
                quantities: previous.quantities.map((q) => {
                  if (q.id === quantity.id) {
                    return { ...q, ...parse(v) };
                  }
                  return q;
                }),
              }));
            }}
          />
          <span className={"w-7"} />
        </div>
      ))}
      <Divider />
      <ButtonGroup>
        <button
          type={"button"}
          className={"px-2"}
          disabled={!isEditing}
          onClick={() => {
            setModifiedIngredient(structuredClone(ingredient));
            setChanges({ removals: [], modifications: [] });
            setIsEditing(false);
          }}
        >
          Cancel
        </button>
        <button
          type={"button"}
          className={"px-2"}
          onClick={() => {
            if (isEditing) {
              applyModifications(changes);
            }
            setIsEditing((b) => !b);
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
        <button
          type={"button"}
          className={"px-2"}
          disabled={ingredient.note !== null}
          onClick={() => {
            setNewNote("...");
          }}
        >
          Note
        </button>
        <button
          type={"button"}
          className={"px-2 bg-gray-700 text-white"}
          onClick={() =>
            deleteIngredient.mutate({ ingredient: ingredient.name })
          }
        >
          Delete
        </button>
        <Link
          className={"underline"}
          from={Route.fullPath}
          to={"/ingredients"}
          search={{ ingredient: { id: ingredient.id } }}
        >
          Full edit
        </Link>
      </ButtonGroup>
    </div>
  );
}

function Tags(props: {
  token: string;
  ingredientId: Ingredient["id"];
  tags: string[];
  isEditing?: boolean;
}) {
  return (
    <div className={"flex flex-row gap-2"}>
      {props.tags.map((t) => (
        <p className={"lowercase"} key={t}>
          #{t}
        </p>
      ))}
      {props.isEditing && (
        <SelectTags
          token={props.token}
          ingredientId={props.ingredientId}
          currentTags={props.tags}
        />
      )}
    </div>
  );
}
