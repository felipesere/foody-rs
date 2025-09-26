import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import {
  useAllIngredients,
  useSetIngredientTags,
} from "../apis/ingredients.ts";
import { useAllRecipes, useChangeRecipe } from "../apis/recipes.ts";
import { FieldSet } from "../components/fieldset.tsx";
import { Labeled } from "../components/Labeled.tsx";
import { Pill } from "../components/pill.tsx";

export const Route = createFileRoute("/_auth/tags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useRouteContext();
  const [recipesOrIngredients, setRecipesOrIngredients] = useState<
    "ingredients" | "recipes"
  >("ingredients");

  return (
    <div className="content-grid space-y-4">
      <div className={"flex flex-row flex-wrap gap-2"}>
        <Labeled label={"Ingredients"} htmlFor={"ingredients"}>
          <input
            type="radio"
            id="ingredients"
            name="ingredients"
            value="ingredients"
            checked={recipesOrIngredients === "ingredients"}
            onChange={() => setRecipesOrIngredients("ingredients")}
          />
        </Labeled>
        <Labeled label={"Recipes"} htmlFor={"recipes"}>
          <input
            type="radio"
            id="recipes"
            name="recipes"
            value="recipes"
            checked={recipesOrIngredients === "recipes"}
            onChange={() => setRecipesOrIngredients("recipes")}
          />
        </Labeled>
      </div>
      {recipesOrIngredients === "ingredients" ? (
        <EditIngredietns token={token} />
      ) : (
        <EditRecipes token={token} />
      )}
    </div>
  );
}

function EditIngredietns(props: { token: string }) {
  let token = props.token;
  let ingredients = useAllIngredients(token);

  const setTags = useSetIngredientTags(token);

  if (!ingredients.data || ingredients.isLoading) {
    return <p>Loading</p>;
  }

  return (
    <EditTags
      items={ingredients.data}
      onToggleTags={(id, tags) => setTags.mutate({ tags, id })}
    />
  );
}

function EditRecipes(props: { token: string }) {
  let token = props.token;
  let recipes = useAllRecipes(token);

  const changeRecipe = useChangeRecipe(token);

  if (!recipes.data || recipes.isLoading) {
    return <p>Loading</p>;
  }

  return (
    <EditTags
      items={recipes.data.recipes}
      onToggleTags={(id, tags) =>
        changeRecipe.mutate({
          changes: [{ type: "tags", value: tags }],
          recipeId: id,
        })
      }
    />
  );
}

export interface TaggedItem {
  id: number;
  name: string;
  tags: string[];
}

export interface EditTagsProps {
  items: TaggedItem[];
  onToggleTags: (id: TaggedItem["id"], tags: string[]) => void;
}

export function EditTags(props: EditTagsProps) {
  const [newTags, setNewTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [batchEdit, setBatchEdit] = useState(false);

  let tags = props.items
    .flatMap((i) => i.tags)
    .sort()
    .filter((x, i, a) => a.indexOf(x) == i);

  let knownTags = new Set([...tags, ...newTags]);

  return (
    <>
      <FieldSet>
        <button className={"px-2"} onClick={() => setBatchEdit((v) => !v)}>
          Toggle Batch Edit
        </button>
        <p>New tags</p>
        <input className={"px-2 border-2"} type={"text"} ref={inputRef} />
        <button
          className={"px-2"}
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
        <ul className={"flex flex-row flex-wrap gap-2"}>
          {newTags.map((tag) => (
            <li>
              <Pill
                value={tag}
                onClose={(thisTag) => {
                  setNewTags((prevTags) =>
                    prevTags.filter((tag) => tag !== thisTag),
                  );
                }}
              />
            </li>
          ))}
        </ul>
      </FieldSet>
      <TagsTable
        batchEdit={batchEdit}
        items={props.items}
        knownTags={Array.from(knownTags.values())}
        toggleTags={props.onToggleTags}
      />
    </>
  );
}

export function TagsTable(props: {
  items: TaggedItem[];
  knownTags: string[];
  toggleTags: (ingredient: TaggedItem["id"], tags: string[]) => void;
  batchEdit: boolean;
}) {
  const batchEdit = props.batchEdit;
  const knownTags = props.knownTags;
  const toggleTags = props.toggleTags;
  const helper = createColumnHelper<TaggedItem>();

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
          let batchTags = knownTags.map((t) => {
            const existingTag = ingredient.tags.includes(t);
            const color = existingTag ? `text-black` : `text-gray-400`;
            const tags = existingTag
              ? ingredient.tags.filter((tag) => tag != t)
              : [...ingredient.tags, t];

            return (
              <span
                onClick={() => toggleTags(ingredient.id, tags)}
                className={`bg-white border-2 px-2 mr-2 ${color}`}
              >
                {t}
              </span>
            );
          });
          let ownTags = ingredient.tags.map((t) => {
            return <span className={`bg-white border-2 px-2 mr-2`}>{t}</span>;
          });
          return (
            <td className={"p-2 flex flex-row gap-2 flex-wrap"}>
              {batchEdit ? batchTags : ownTags}
            </td>
          );
        },
      }),
    ],
    [helper, batchEdit, knownTags],
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
          <th className={"p-2"}>Tags</th>
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
