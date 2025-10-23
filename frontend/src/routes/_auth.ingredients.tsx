import { createFileRoute, useNavigate } from "@tanstack/react-router";
import classnames from "classnames";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  addIngredientToShoppinglist,
  type Ingredient,
  useAllIngredients,
  useAllIngredientTags,
  useSetIngredientStorage,
  useSetIngredientTags,
} from "../apis/ingredients.ts";
import { type Storage, useAllStorages } from "../apis/storage.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { MultiSelect } from "../components/multiselect.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";
import { AddToShoppinglist } from "../components/smart/addToShoppinglist.tsx";
import { SelectAisle } from "../components/smart/selectAisle.tsx";
import { SelectTags } from "../components/smart/selectTags.tsx";
import { TagsTable } from "../components/tags.tsx";
import { ToggleButton } from "../components/toggle.tsx";
import { orderByTag } from "../domain/orderByTag.ts";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const ingredientSearchSchema = z.object({
  search: z
    .object({
      tags: z.array(z.string()).optional(),
      aisle: z.array(z.string()).optional(),
    })
    .optional(),
  massEdit: z.union([z.literal("tags"), z.literal("storedIn")]).optional(),
});

type IngredientSearch = z.infer<typeof ingredientSearchSchema>;

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
  validateSearch: ingredientSearchSchema,
});

function updateSearch(change: IngredientSearch["search"]) {
  return (params: IngredientSearch) => {
    const search = {
      ...params.search,
      ...change,
    };
    if (!search.aisle && !search.tags) {
      return {
        ...params,
        search: undefined,
      };
    }

    return {
      ...params,
      search,
    };
  };
}

function IngredientsPage() {
  const { token } = Route.useRouteContext();
  const { search, massEdit } = Route.useSearch();
  const navigate = useNavigate({ from: Route.path });
  const ingredients = useAllIngredients(token);
  const allTags = useAllIngredientTags(token);

  if (!ingredients.data || !allTags.data) {
    return <p>Loading...</p>;
  }

  const allAisles = new Set(
    ingredients.data.filter((i) => i.aisle).map((i) => i.aisle!.name),
  );

  // TODO: Extract into function
  const filteredIngredients = ingredients.data.filter((ingredient) => {
    if (search?.tags) {
      if (!search.tags.some((tag) => ingredient.tags.includes(tag))) {
        return false;
      }
    }
    if (search?.aisle && ingredient.aisle) {
      if (!search.aisle.includes(ingredient.aisle.name)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="content-grid">
      <FieldSet className={{ fieldSet: "flex-wrap" }}>
        <ButtonGroup>
          <Button
            label={"Mass edit tags"}
            onClick={() =>
              navigate({
                to: ".",
                search: (params) => {
                  return {
                    ...params,
                    massEdit: massEdit === "tags" ? undefined : "tags",
                  };
                },
              })
            }
          />
          <Button
            label={"Mass edit storage locations"}
            onClick={() =>
              navigate({
                to: ".",
                search: (params) => {
                  return {
                    ...params,
                    massEdit: massEdit === "storedIn" ? undefined : "storedIn",
                  };
                },
              })
            }
          />
        </ButtonGroup>
        <FieldSet legend={"Filter"}>
          <MultiSelect
            label={"Select tags"}
            selected={search?.tags || []}
            items={allTags.data.tags}
            onItemsSelected={(items) => {
              navigate({
                to: ".",
                search: updateSearch({
                  tags: items.length ? items : undefined,
                }),
              });
            }}
          />
          <MultiSelect
            label={"Select aisle"}
            selected={search?.aisle || []}
            items={Array.from(allAisles)}
            onItemsSelected={(items) => {
              navigate({
                to: ".",
                search: updateSearch({
                  aisle: items.length ? items : undefined,
                }),
              });
            }}
          />
        </FieldSet>
      </FieldSet>
      {massEdit === "tags" && (
        <MassEditTags token={token} ingredients={filteredIngredients} />
      )}
      {massEdit === "storedIn" && (
        <MassEditStoredIn token={token} ingredients={filteredIngredients} />
      )}
      {massEdit === undefined && (
        <Overview token={token} ingredients={filteredIngredients} />
      )}
    </div>
  );
}

function Overview(props: { ingredients: Ingredient[]; token: string }) {
  const sections = orderByTag(props.ingredients);
  sections.sort((a, b) => a.items.length - b.items.length);

  return (
    <ul className="gap-4 columns-xs space-y-10 mt-4">
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
                    token={props.token}
                    onClick={() => {}}
                  />
                );
              })}
            </ol>
          </div>
        );
      })}
    </ul>
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
          <div className={"flex flex-row gap-4"}>
            <p>Stored in:</p>
            {props.ingredient.stored_in?.name || "None"}
          </div>
          <Divider />
          <ButtonGroup>
            <Button
              label={"Edit"}
              onClick={() => {
                setEdit((e) => !e);
              }}
              type={"button"}
              classNames={{ "border-amber-400": edit }}
            />
            <Button label={"Reset"} type="button" onClick={() => {}} />
          </ButtonGroup>
        </>
      )}
    </li>
  );
}

function MassEditTags(props: { token: string; ingredients: Ingredient[] }) {
  let ingredients = props.ingredients;
  const [newTags, setNewTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTags = useSetIngredientTags(props.token);

  let tags = ingredients
    .flatMap((i) => i.tags)
    .sort()
    .filter((x, i, a) => a.indexOf(x) == i);

  let knownTags = new Set([...tags, ...newTags]);

  return (
    <div className={"mt-4"}>
      <input
        placeholder={"Additional Tag"}
        className={"px-2 border-2"}
        type={"text"}
        ref={inputRef}
      />
      <button
        className={"px-2 ml-2"}
        type={"button"}
        onClick={() => {
          let newTag = inputRef.current?.value;
          if (newTag) {
            setNewTags((prevTags) => [...prevTags, newTag]);
          }
        }}
      >
        Add
      </button>
      <TagsTable
        batchEdit={true}
        items={ingredients}
        knownTags={Array.from(knownTags.values())}
        toggleTags={(id, tags) => {
          updateTags.mutate({
            id,
            tags,
          });
        }}
      />
    </div>
  );
}

function MassEditStoredIn(props: { token: string; ingredients: Ingredient[] }) {
  let ingredients = props.ingredients;

  const knownStorageLocations = useAllStorages(props.token);
  const updateStorageLocation = useSetIngredientStorage(props.token);

  if (!knownStorageLocations.data || knownStorageLocations.isLoading) {
    return "Loading";
  }

  let storageLocations = knownStorageLocations.data.sort(
    (a, b) => a?.name.localeCompare(b?.name || "") || 0,
  );

  return (
    <div className={"mt-4"}>
      <StoredInTable
        batchEdit={true}
        items={ingredients}
        knownStorageLocations={storageLocations}
        toggleStorageLocation={(ingredient, id) => {
          updateStorageLocation.mutate({ id, ingredient });
        }}
      />
    </div>
  );
}

// Shamelessly duplicated
// TODO: Come back to this!
export function StoredInTable(props: {
  items: Ingredient[];
  knownStorageLocations: Storage[];
  toggleStorageLocation: (
    ingredient: Ingredient["id"],
    id: Storage["id"] | null,
  ) => void;
  batchEdit: boolean;
}) {
  const batchEdit = props.batchEdit;
  const knownStorageLocations = props.knownStorageLocations;
  const toggleStorage = props.toggleStorageLocation;
  const helper = createColumnHelper<Ingredient>();

  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "Name",
        cell: (cell) => <td className={"p-2"}>{cell.row.original.name}</td>,
      }),
      helper.accessor("tags", {
        header: "Tags",
        cell: (cell) => {
          const ingredient = cell.row.original;
          let togglableStorageLocations = knownStorageLocations.map((t) => {
            const isStoredIn = ingredient.stored_in?.id === t.id;
            const color = isStoredIn ? `text-black` : `text-gray-400`;
            const newStorageId = isStoredIn ? null : t.id;

            return (
              <span
                onClick={() => toggleStorage(ingredient.id, newStorageId)}
                className={`bg-white border-2 px-2 mr-2 ${color}`}
              >
                {t.name}
              </span>
            );
          });
          let ownStorageLocation =
            ingredient.stored_in === null ? (
              ""
            ) : (
              <span className={`bg-white border-2 px-2 mr-2`}>
                {ingredient.stored_in.name}
              </span>
            );
          return (
            <td className={"p-2 flex flex-row gap-2 flex-wrap"}>
              {batchEdit ? togglableStorageLocations : ownStorageLocation}
            </td>
          );
        },
      }),
    ],
    [helper, batchEdit, knownStorageLocations],
  );

  const table = useReactTable({
    columns,
    data: props.items,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className={"w-full border-spacing-2 border-collapse text-left"}>
      <thead>
        <tr>
          <th className={"p-2"}>Name</th>
          <th className={"p-2"}>Stored In</th>
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={"hover:bg-slate-400 even:bg-gray-100 odd:bg-white"}
          >
            {row
              .getVisibleCells()
              .map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext()),
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
