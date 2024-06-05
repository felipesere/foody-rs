import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { Fragment, useState } from "react";
import { addIngredientToShoppinglist } from "../apis/ingredients.ts";
import { type StoredQuantity, useAllRecipes } from "../apis/recipes.ts";
import {
  type Ingredient,
  type Shoppinglist,
  useRemoveIngredientFromShoppinglist,
  useRemoveQuantityFromShoppinglist,
  useToggleIngredientInShoppinglist,
  useUpdateQuantityOnShoppinglist,
} from "../apis/shoppinglists.ts";
import { useShoppinglist } from "../apis/shoppinglists.ts";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteRowButton } from "../components/deleteRowButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { Editable } from "../components/editable.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
import { Toggle, ToggleButton } from "../components/toggle.tsx";
import { combineQuantities, humanize, parse } from "../quantities.ts";

export const Route = createFileRoute("/_auth/shoppinglist/$shoppinglistId")({
  component: ShoppingPage,
});

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

  const [groupByAisles, setGroupByAisles] = useState(false);

  if (shoppinglist.isLoading || recipes.isLoading) {
    return <p>Loading</p>;
  }

  if (shoppinglist.isError || recipes.isError) {
    return <p>Failed to load shoppinglist or recipes</p>;
  }

  const allRecipes =
    recipes.data?.recipes.reduce(
      (acc, recipe) => {
        acc[recipe.id] = recipe.name;
        return acc;
      },
      {} as Record<number, string>,
    ) || {};

  const tagged: Record<string, Ingredient[]> = {};
  const untagged: Ingredient[] = [];
  for (const i of shoppinglist.data?.ingredients || []) {
    if (i.tags.length) {
      const first = i.tags[0];
      const taggedIngredients = tagged[first] || [];
      taggedIngredients.push(i);
      tagged[first] = taggedIngredients;
    } else {
      untagged.push(i);
    }
  }

  return (
    <div className="content-grid space-y-4 max-w-md">
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
          <div className={"flex flex-row gap-2"}>
            <input
              id={"groupByAisle"}
              type={"checkbox"}
              className={"px-2 bg-white shadow"}
              checked={groupByAisles}
              onChange={() => setGroupByAisles((b) => !b)}
            />
            <label className={"no-colon"} htmlFor={"groupByAisle"}>
              <span className={"font-bold"}>G</span>
              roup by aisle
            </label>
          </div>
        </FieldSet>
      </Toggle>
      <ul className="grid max-w-md gap-4">
        {groupByAisles ||
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
        {groupByAisles &&
          Object.entries(tagged).map(([tag, ingredients]) => {
            return (
              <Fragment key={tag}>
                <Divider label={tag} key={tag} />
                {ingredients.map((ingredient) => (
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
            );
          })}

        {groupByAisles && untagged.length && (
          <>
            <Divider label={"Untagged"} key={"untagged"} />
            {untagged.map((ingredient) => (
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
          </>
        )}
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
          className={"px-2 bg-gray-700 text-white"}
          onClick={() =>
            deleteIngredient.mutate({ ingredient: ingredient.name })
          }
        >
          Delete
        </button>
      </ButtonGroup>
    </div>
  );
}
