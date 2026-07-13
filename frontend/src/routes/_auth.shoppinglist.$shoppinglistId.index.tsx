import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import classnames from "classnames";
import { Fragment, useRef, useState } from "react";
import { Ingredient } from "../api/v1/ingredient.ts";
import { Recipe, useRecipes } from "../api/v1/recipes.ts";
import {
  Shoppinglist,
  ShoppinglistItem,
  StoredQuantity,
  useAddItem,
  useClearList,
  useDeleteItem,
  useDeleteQuantity,
  useRemoveRecipe,
  useShoppinglist,
  useUpdateItem,
  useUpdateQuantity,
} from "../api/v1/shoppinglists.ts";
import { Button } from "../components/button.tsx";
import { DeleteButton } from "../components/deleteButton.tsx";
import { Divider } from "../components/divider.tsx";
import { Editable } from "../components/editable.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { Labeled } from "../components/Labeled.tsx";
import { Progressbar } from "../components/progressbar.tsx";
import { SelectAisle } from "../components/smart/selectAisle.tsx";
import { SelectIngredientWithQuantity } from "../components/smart/selectIngredientWithQuantity.tsx";
import { Tags } from "../components/tags.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { orderByAisles } from "../domain/orderByAisle.ts";
import { orderByRecipe, type Section } from "../domain/orderByRecipe.ts";
import { combineQuantities, humanize, parse } from "../quantities.ts";

export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId/")({
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
  const shoppinglist = useShoppinglist(shoppinglistId);
  const recipes = useRecipes();
  const updateShoppinglist = useUpdateItem();
  const addIngredient = useAddItem();
  const [grouping, setGrouping] = useState<Grouping>(Grouping.ByAisle);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const removeCheckedItems = useClearList();

  const deleteRecipe = useRemoveRecipe();

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
    shoppinglist.data?.ingredients.filter((i) => i.in_basket) || [];

  const fraction =
    (inBasket.length / (shoppinglist.data?.ingredients.length || 1)) * 100;

  return (
    <div className="content-grid space-y-1lh pb-10lh">
      <Toggle buttonLabel={"More..."}>
        <Link
          to={"/shoppinglist/$shoppinglistId/fullscreen"}
          params={{ shoppinglistId: shoppinglistId.toString() }}
          search={{ index: 0 }}
        >
          Fullscreen
        </Link>

        <div className={"mb-1lh"}>
          <FieldSet legend={"Add ingredient"}>
            <SelectIngredientWithQuantity
              onIngredient={(ingredient, _, raw) => {
                // TODO: Do this better, consider accepting the param pre-parsed in the backend?
                addIngredient.mutate({
                  shoppinglistId,
                  ingredient_id: ingredient.id,
                  quantity: raw,
                });
              }}
            />
          </FieldSet>
          <FieldSet
            legend={"Filter and Sort"}
            className={{ fieldSet: "mt-1lh flex flex-col" }}
          >
            <div>
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
          <div className={"px-1ch py-1lh flex flex-row gapx-2ch"}>
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
          <div className={"px-1ch flex flex-row gapx-2ch py-1lhch"}>
            <Button
              label={"Clear checked items"}
              onClick={() => removeCheckedItems.mutate({ shoppinglistId })}
            />
          </div>
        </div>
        <FieldSet legend={"Recipes"}>
          <ul className={"space-y-1lh "}>
            {Object.entries(presentRecipes).map(([id, name]) => (
              <RecipeRow
                key={id}
                id={id}
                name={name}
                // TODO/WARN: Annoying when the ID types don't line up!
                onDelete={() =>
                  deleteRecipe.mutate({ shoppinglistId, recipeId: Number(id) })
                }
              />
            ))}
          </ul>
        </FieldSet>
      </Toggle>
      {showProgressBar && <Progressbar fraction={fraction} sticky={true} />}
      <ul className="grid max-w-md gap-y-1lh">
        {sections.map((section) => (
          <Fragment key={section.name}>
            <Divider
              className={"capitalize text-nowrap"}
              label={section.name}
            />
            {section.items.map((item) => (
              <CompactIngredientView
                key={item.ingredient.name}
                shoppinglistId={shoppinglistId}
                item={item}
                allRecipes={allRecipes}
                onToggle={(_ingredientId, inBasket) => {
                  updateShoppinglist.mutate({
                    shoppinglistId,
                    item_id: item.id,
                    fields: {
                      in_basket: inBasket,
                    },
                  });
                }}
              />
            ))}
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

function RecipeRow(props: { id: string; name: string; onDelete: () => void }) {
  return (
    <li className={"flex flex-row gap-4ch hover:bg-slate-200"}>
      <Link
        className={"block flex-grow"}
        to={"/recipes/$recipeId"}
        params={{ recipeId: props.id }}
      >
        {props.name}
      </Link>
      <Button
        label={"Delete"}
        className={"self-end"}
        onClick={props.onDelete}
      />
    </li>
  );
}

function CompactIngredientView({
  item,
  shoppinglistId,
  onToggle,
  allRecipes,
}: {
  item: ShoppinglistItem;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
  onToggle: (ingredient: Ingredient["id"], inBasket: boolean) => void;
}) {
  const checked = item.in_basket;
  const [open, setOpen] = useState(false);
  return (
    <li
      className={classnames(
        "border-black border-solid border-2 px-1ch py-0.5lh max-w-md overflow-hidden",
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
        <p>{combineQuantities(item.quantities)}</p>
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
      </div>
      {open && (
        <EditIngredient
          item={item}
          shoppinglistId={shoppinglistId}
          allRecipes={allRecipes}
        />
      )}
    </li>
  );
}

type EditIngredientProps = {
  item: ShoppinglistItem;
  shoppinglistId: Shoppinglist["id"];
  allRecipes: Record<number, string>;
};

type Changes = {
  note?: string;
  removals: Array<StoredQuantity["id"]>;
  modifications: Array<{ value: string; quantity: StoredQuantity["id"] }>;
};

function RecipeAndQuantity(props: {
  editing: boolean;
  onClick: () => void;
  quantity: StoredQuantity;
  onBlur: (v: string) => void;
}) {
  return (
    <div className={"flex flex-row items-end gap-1ch"}>
      {props.editing ? (
        <DeleteButton className={"text-red-700"} onClick={props.onClick} />
      ) : null}
      <p className="flex-shrink-0 min-w-0 max-w-[85%] overflow-hidden whitespace-nowrap">
        {props.quantity.recipe_id ? (
          <LinkToRecipe recipeId={props.quantity.recipe_id} />
        ) : (
          "Manual"
        )}
      </p>
      <span className="flex-grow border-b-[3px] border-dotted border-gray-600 min-w-1ch self-end mb-[0.3em]" />
      <span className={"flex-shrink-0 whitespace-nowrap"}>
        <Editable
          isEditing={props.editing}
          value={humanize(props.quantity)}
          onBlur={props.onBlur}
        />
      </span>
    </div>
  );
}

function LinkToRecipe(props: { recipeId: Recipe["id"] }) {
  let q = useQueryClient();
  let data = q.getQueryData<{ recipes: Recipe[] }>(["recipes"])?.recipes || [];
  let recipe = data.find((r) => r.id === props.recipeId);
  if (!recipe) {
    return null;
  }
  return (
    <Link to={"/recipes/$recipeId"} params={{ recipeId: recipe.id.toString() }}>
      {recipe.name}
    </Link>
  );
}

function EditIngredient({ item, shoppinglistId }: EditIngredientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateIngredient = useUpdateItem();
  const deleteItem = useDeleteItem();

  // Pending edits are collected in a ref rather than state: an `Editable` blur
  // fires while focus is moving to the next field, and re-rendering here would
  // let `use-editable` steal focus back to the field being left. The ref lets
  // us record edits without a render; `modifiedIngredient` is only updated on
  // discrete clicks (delete / Save / Cancel), where a render is harmless.
  const changesRef = useRef<Changes>({ removals: [], modifications: [] });
  const [modifiedIngredient, setModifiedIngredient] = useState(
    structuredClone(item),
  );

  const removeQuantity = useDeleteQuantity();
  const updateQuantity = useUpdateQuantity();

  function resetChanges() {
    changesRef.current = { removals: [], modifications: [] };
  }

  function applyModifications(changesToIngredient: Changes) {
    if (changesToIngredient.note !== undefined) {
      updateIngredient.mutate({
        shoppinglistId,
        item_id: item.id,
        fields: { note: changesToIngredient.note },
      });
    }

    for (const m of changesToIngredient.modifications) {
      updateQuantity.mutate({
        shoppinglistId,
        item_id: item.id,
        quantity_id: m.quantity,
        quantity: m.value,
      });
    }

    for (const id of changesToIngredient.removals) {
      removeQuantity.mutate({
        shoppinglistId,
        item_id: item.id,
        quantity_id: id,
      });
    }
  }

  return (
    <div className="max-w-full overflow-hidden">
      <Divider />
      {modifiedIngredient.quantities.map((quantity) => (
        <RecipeAndQuantity
          key={quantity.id}
          quantity={quantity}
          editing={isEditing}
          onClick={() => {
            changesRef.current.removals.push(quantity.id);
            setModifiedIngredient((previous) => ({
              ...previous,
              quantities: previous.quantities.filter(
                (q) => q.id !== quantity.id,
              ),
            }));
          }}
          onBlur={(v) => {
            const { modifications } = changesRef.current;
            const existing = modifications.find(
              (m) => m.quantity === quantity.id,
            );
            if (existing) {
              existing.value = v;
            } else {
              modifications.push({ value: v, quantity: quantity.id });
            }
          }}
        />
      ))}
      {item.ingredient.tags && (
        <>
          <Divider />
          <Tags tags={item.ingredient.tags} />
        </>
      )}
      {(item.note || isEditing) && (
        <>
          <Divider />
          <div className={"flex flex-row gapx-2ch py-1lhch"}>
            <span>Note:</span>
            <Editable
              isEditing={isEditing}
              value={modifiedIngredient.note || ""}
              onBlur={(v) => {
                changesRef.current.note = v;
              }}
            />
          </div>
        </>
      )}
      <Divider />
      <div className={"flex flex-row gap-x-2ch py-1lhch"}>
        <Button
          label={isEditing ? "Save" : "Edit"}
          onClick={() => {
            if (isEditing) {
              const pending = changesRef.current;
              applyModifications(pending);
              // Reflect the saved edits locally until the query refetches, so
              // the row doesn't flash back to its old value on Save.
              setModifiedIngredient((previous) => ({
                ...previous,
                note: pending.note ?? previous.note,
                quantities: previous.quantities.map((q) => {
                  const mod = pending.modifications.find(
                    (m) => m.quantity === q.id,
                  );
                  return mod ? { ...q, ...parse(mod.value) } : q;
                }),
              }));
            }
            resetChanges();
            setIsEditing((v) => !v);
          }}
        />
        {isEditing && (
          <Button
            label={"Cancel"}
            onClick={() => {
              resetChanges();
              setModifiedIngredient(structuredClone(item));
              setIsEditing(false);
            }}
          />
        )}
        <SelectAisle
          ingredientId={item.ingredient.id}
          currentAisle={item.ingredient.aisle}
        />
        <Button
          dark
          label={"Delete"}
          onClick={() => {
            deleteItem.mutate({
              shoppinglistId: shoppinglistId,
              item_id: item.id,
            });
          }}
        />
      </div>
    </div>
  );
}
