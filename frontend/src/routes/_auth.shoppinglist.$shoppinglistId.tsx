import { Link, createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { Fragment, useState } from "react";
import {
  type Ingredient,
  addIngredientToShoppinglist,
} from "../apis/ingredients.ts";
import {
  type Recipe,
  type StoredQuantity,
  useAllRecipes,
} from "../apis/recipes.ts";
import {
  type Shoppinglist,
  type ShoppinglistItem,
  useRemoveInBasketItemsFromShoppinglist,
  useRemoveIngredientFromShoppinglist,
  useRemoveQuantityFromShoppinglist,
  useRemoveRecipeFromShoppinglist,
  useSetNoteOnIngredient,
  useToggleIngredientInShoppinglist,
  useUpdateQuantityOnShoppinglist,
} from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteButton } from "../components/deleteButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { Editable } from "../components/editable.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { Progressbar } from "../components/progressbar.tsx";
import { SelectAisle } from "../components/smart/selectAisle.tsx";
import { SelectIngredientWithQuantity } from "../components/smart/selectIngredientWithQuantity.tsx";
import { SelectTags } from "../components/smart/selectTags.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { orderByAisles } from "../domain/orderByAisle.ts";
import { type Section, orderByRecipe } from "../domain/orderByRecipe.ts";
import { combineQuantities, humanize, parse } from "../quantities.ts";

export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId")({
  component: ShoppingPage,
});

enum Grouping {
  None = "none",
  ByAisle = "byAisle",
  ByRecipe = "byRecipe",
}

function GroupingLabel(v: Grouping): string {
  switch (v) {
    case Grouping.None:
      return "None";
    case Grouping.ByAisle:
      return "By Aisle";
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
  const removeCheckedItems = useRemoveInBasketItemsFromShoppinglist(
    token,
    shoppinglistId,
  );

  const deleteRecipe = useRemoveRecipeFromShoppinglist(token, shoppinglistId);

  if (shoppinglist.isLoading || !recipes.data) {
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
  const items = shoppinglist.data?.ingredients || [];
  switch (grouping) {
    case "none":
      sections = [{ name: "Items", items: items }];
      break;
    case "byAisle":
      sections = orderByAisles(items);
      break;
    case "byRecipe":
      sections = orderByRecipe(items, allRecipes);
      break;
  }

  const presentRecipes: Record<number, string> = {};
  for (const i of items) {
    for (const q of i.quantities) {
      if (q.recipe_id) {
        presentRecipes[q.recipe_id] = allRecipes[q.recipe_id];
      }
    }
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
          <SelectIngredientWithQuantity
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
              <div className={"flex flex-row gap"} key={option}>
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
        <div className={"p-2 flex flex-row gap-2"}>
          <Button
            label={"Clear checked items"}
            onClick={() => removeCheckedItems.mutate()}
          />
        </div>
        <FieldSet legend={"Recipes"}>
          <ul>
            {Object.entries(presentRecipes).map(([id, name]) => (
              <li key={id} className={"flex flex-row gap-4"}>
                <Link
                  className={"block flex-grow"}
                  to={"/recipes/$recipeId"}
                  params={{ recipeId: id }}
                >
                  {name}
                </Link>
                <Button
                  label={"Delete"}
                  onClick={() => {
                    // TODO/WARN: Annoying when the ID types don't line up!
                    deleteRecipe.mutate({ recipeId: Number(id) });
                  }}
                />
              </li>
            ))}
          </ul>
        </FieldSet>
      </Toggle>
      {showProgressBar && <Progressbar fraction={fraction} sticky={true} />}
      <ul className="grid max-w-md gap-4">
        {sections.map((section) => (
          <Fragment key={section.name}>
            <Divider className={"capitalize"} label={section.name} />
            {section.items.map((item) => (
              <CompactIngredientView
                key={item.ingredient.name}
                token={token}
                shoppinglistId={shoppinglistId}
                item={item}
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
  item,
  shoppinglistId,
  onToggle,
  allRecipes,
}: {
  token: string;
  item: ShoppinglistItem;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  onToggle: (ingredient: Ingredient["id"], inBasket: boolean) => void;
}) {
  const checked = item.quantities.some((q) => q.in_basket);
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
            onToggle(item.ingredient.id, !checked);
          }}
        />
        <p
          onClick={() => {
            onToggle(item.ingredient.id, !checked);
            // setChecked((checked) => !checked);
          }}
          className={classnames(
            "flex-grow inline capitalize ml-2 font-black tracking-wider",
          )}
        >
          {item.ingredient.name}{" "}
          {item.note && <span className={"font-light text-gray-600"}>Ⓝ</span>}
        </p>
        <p>{combineQuantities(item.quantities.map((p) => p.quantity))}</p>
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
      </div>
      {open && (
        <EditIngredient
          item={item}
          shoppinglistId={shoppinglistId}
          allRecipes={allRecipes}
          token={token}
        />
      )}
    </li>
  );
}

type EditIngredientProps = {
  item: ShoppinglistItem;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  token: string;
};

type Changes = {
  removals: Array<StoredQuantity["id"]>;
  modifications: Array<{ value: string; quantity: StoredQuantity["id"] }>;
};

function EditIngredient({
  item,
  token,
  shoppinglistId,
  allRecipes,
}: EditIngredientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState<string | undefined>(undefined);
  const useAddNote = useSetNoteOnIngredient(
    token,
    shoppinglistId,
    item.ingredient.id,
  );

  const [changes, setChanges] = useState<Changes>({
    removals: [],
    modifications: [],
  });
  const [modifiedIngredient, setModifiedIngredient] = useState(
    structuredClone(item),
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

  function LinkToRecipe(props: {
    recipeId: Recipe["id"];
    name: Recipe["name"];
  }) {
    return (
      <Link
        to={"/recipes/$recipeId"}
        params={{ recipeId: props.recipeId.toString() }}
      >
        {props.name}
      </Link>
    );
  }

  return (
    <div>
      <Divider />
      {(item.note || newNote) && (
        <>
          <div className={"flex flex-row gap-2"}>
            <span>Note:</span>
            <Editable
              isEditing={isEditing}
              value={newNote || item.note || ""}
              onBlur={(v) => {
                useAddNote.mutate({ note: v });
              }}
            />
          </div>
          <Divider />
        </>
      )}
      {item.ingredient.tags && (
        <>
          <div className={"flex flex-row gap-2"}>
            <TagsAndAisle
              token={token}
              ingredientId={item.ingredient.id}
              tags={item.ingredient.tags}
              aisle={item.ingredient.aisle?.name ?? null}
              isEditing={isEditing}
            />
          </div>
          <Divider />
        </>
      )}
      {modifiedIngredient.quantities.map((quantity) => (
        <div key={quantity.quantity.id} className={"flex flex-row"}>
          <div className={"w-5"}>
            {isEditing ? (
              <DeleteButton
                className={"text-red-700"}
                onClick={() => {
                  setChanges((previous) => ({
                    ...previous,
                    removals: [...previous.removals, quantity.quantity.id],
                  }));
                  setModifiedIngredient((previous) => ({
                    ...previous,
                    quantities: previous.quantities.filter(
                      (q) => q.quantity.id !== quantity.quantity.id,
                    ),
                  }));
                }}
              />
            ) : null}
          </div>
          <p className={"ml-2"}>
            {quantity.recipe_id ? (
              <LinkToRecipe
                recipeId={quantity.recipe_id}
                name={allRecipes[quantity.recipe_id] || "Manual"}
              />
            ) : (
              "Manual"
            )}
          </p>
          <DottedLine />
          <Editable
            isEditing={isEditing}
            value={humanize(quantity.quantity)}
            onBlur={(v) => {
              console.log(`Edited value: ${v}: ${JSON.stringify(parse(v))}`);
              setChanges((previous) => ({
                ...previous,
                modifications: [
                  ...previous.modifications,
                  { value: v, quantity: quantity.quantity.id },
                ],
              }));
              setModifiedIngredient((previous) => ({
                ...previous,
                quantities: previous.quantities.map((q) => {
                  if (q.quantity.id === quantity.quantity.id) {
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
            setModifiedIngredient(structuredClone(item));
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
          disabled={item.note !== null}
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
            deleteIngredient.mutate({ ingredient: item.ingredient.name })
          }
        >
          Delete
        </button>
        <Link
          className={"underline"}
          from={Route.fullPath}
          to={"/ingredients"}
          search={{ ingredient: { id: item.ingredient.id } }}
        >
          Full edit
        </Link>
      </ButtonGroup>
    </div>
  );
}

function TagsAndAisle(props: {
  token: string;
  ingredientId: Ingredient["id"];
  tags: string[];
  aisle: string | null;
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
        <>
          <SelectTags
            token={props.token}
            ingredientId={props.ingredientId}
            currentTags={props.tags}
          />
          <SelectAisle
            token={props.token}
            ingredientId={props.ingredientId}
            currentAisle={props.aisle}
          />
        </>
      )}
    </div>
  );
}
