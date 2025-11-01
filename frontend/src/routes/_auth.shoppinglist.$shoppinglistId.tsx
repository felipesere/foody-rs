import { createFileRoute, Link } from "@tanstack/react-router";
import classnames from "classnames";
import { Fragment, useState } from "react";
import {
  addIngredientToShoppinglist,
  type Ingredient,
} from "../apis/ingredients.ts";
import {
  type Recipe,
  type StoredQuantity,
  useAllRecipes,
} from "../apis/recipes.ts";
import {
  type Shoppinglist,
  type ShoppinglistItem,
  ShoppingListItemQuantity,
  useRemoveInBasketItemsFromShoppinglist,
  useRemoveIngredientFromShoppinglist,
  useRemoveQuantityFromShoppinglist,
  useRemoveRecipeFromShoppinglist,
  useSetNoteOnIngredient,
  useShoppinglist,
  useToggleIngredientInShoppinglist,
  useUpdateQuantityOnShoppinglist,
} from "../apis/shoppinglists.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteButton } from "../components/deleteButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { Editable } from "../components/editable.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { Labeled } from "../components/Labeled.tsx";
import { Progressbar } from "../components/progressbar.tsx";
import { SelectAisle } from "../components/smart/selectAisle.tsx";
import { SelectIngredientWithQuantity } from "../components/smart/selectIngredientWithQuantity.tsx";
import { SelectTags } from "../components/smart/selectTags.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { orderByAisles } from "../domain/orderByAisle.ts";
import { orderByRecipe, type Section } from "../domain/orderByRecipe.ts";
import { combineQuantities, humanize, parse } from "../quantities.ts";
import { Tags } from "../components/tags.tsx";

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
  const [grouping, setGrouping] = useState<Grouping>(Grouping.ByAisle);
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
    <div className="content-grid space-y-1lh max-w-md pb-10lh">
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
          className={{ fieldSet: "mt-2lh flex flex-col" }}
        >
          <div className={"flex flex-row gap-6ch"}>
            {Object.values(Grouping).map((option) => (
              <Labeled
                key={option}
                label={GroupingLabel(option)}
                htmlFor={option}
              >
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
              </Labeled>
            ))}
          </div>
        </FieldSet>
        <div className={"px-1ch py-1lh flex flex-row gapx-2ch py-1lhch"}>
          <input
            id={"groupByAisle"}
            type={"checkbox"}
            className={"bg-white shadow"}
            checked={showProgressBar}
            onChange={() => setShowProgressBar((b) => !b)}
          />
          <label className={"no-colon pl-1ch"} htmlFor={"groupByAisle"}>
            Show progress bar
          </label>
        </div>
        <div className={"px-1ch py-1lh flex flex-row gapx-2ch py-1lhch"}>
          <Button
            label={"Clear checked items"}
            onClick={() => removeCheckedItems.mutate()}
          />
        </div>
        <FieldSet legend={"Recipes"}>
          <ul className={"space-y-1lh "}>
            {Object.entries(presentRecipes).map(([id, name]) => (
              <li
                key={id}
                className={"flex flex-row gap-4ch hover:bg-slate-200"}
              >
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
      <ul className="grid max-w-md gap-x-1ch gap-y-1lh">
        {sections.map((section) => (
          <Fragment key={section.name}>
            <Divider
              className={"capitalize text-nowrap"}
              label={section.name}
            />
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
      className={classnames(
        "border-black border-solid border-2 px-1ch py-0.5lh",
        {
          "bg-gray-200 text-gray-500": checked,
        },
      )}
    >
      <div className={classnames("flex flex-row")}>
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
          }}
          className={classnames(
            "flex-grow inline capitalize ml-2ch font-black tracking-wider",
            {
              "line-through": checked,
            },
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

function RecipeAndQuantity(props: {
  editing: boolean;
  onClick: () => void;
  quantity: ShoppingListItemQuantity;
  allRecipes: Record<number, string>;
  onBlur: (v: string) => void;
}) {
  return (
    <div className={"flex flex-row"}>
      {props.editing ? (
        <DeleteButton className={"text-red-700"} onClick={props.onClick} />
      ) : null}
      <p>
        {props.quantity.recipe_id ? (
          <LinkToRecipe
            recipeId={props.quantity.recipe_id}
            name={props.allRecipes[props.quantity.recipe_id] || "Manual"}
          />
        ) : (
          "Manual"
        )}
      </p>
      <DottedLine />
      <Editable
        isEditing={props.editing}
        value={humanize(props.quantity.quantity)}
        onBlur={props.onBlur}
      />
    </div>
  );
}

function LinkToRecipe(props: { recipeId: Recipe["id"]; name: Recipe["name"] }) {
  return (
    <Link
      to={"/recipes/$recipeId"}
      params={{ recipeId: props.recipeId.toString() }}
    >
      {props.name}
    </Link>
  );
}

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

  return (
    <div>
      <Divider />
      {(item.note || newNote) && (
        <>
          <div className={"flex flex-row gapx-2ch py-1lhch"}>
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
          <div className={"flex flex-row gapx-2ch"}>
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
        <RecipeAndQuantity
          key={quantity.quantity.id}
          quantity={quantity}
          allRecipes={allRecipes}
          editing={isEditing}
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
          onBlur={(v) => {
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
      ))}
      <Divider />
      <ButtonGroup>
        <button
          type={"button"}
          className={"px-2ch"}
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
          className={"px-2ch"}
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
          className={"px-2ch"}
          disabled={item.note !== null}
          onClick={() => {
            setNewNote("...");
          }}
        >
          Note
        </button>
        <button
          type={"button"}
          className={"px-2ch bg-gray-700 text-white"}
          onClick={() =>
            deleteIngredient.mutate({ ingredient: item.ingredient.name })
          }
        >
          Delete
        </button>
        <Link className={"underline"} from={Route.fullPath} to={"/ingredients"}>
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
    <div className={"flex flex-row gapx-2ch"}>
      <Tags tags={props.tags} />
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
