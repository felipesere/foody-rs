import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useRef } from "react";
import { Button } from "./button.tsx";

export function Tags(props: { tags: string[] }) {
  return (
    <ol className={"flex flex-row flex-wrap gapx-2ch py-1lhch"}>
      {props.tags.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ol>
  );
}

interface Props {
  tags: string[];
}
interface EditableProps {
  allTags: string[];
  editing: boolean;
  onSetTags: (items: string[]) => void;
}

type AllOrNothing<T> = T | Partial<Record<keyof T, undefined>>;

function merge(left: Array<string>, right: Array<string>): Array<string> {
  let merged = new Set<string>([...left, ...right]);
  return Array.from(merged);
}

function toggle(
  items: Array<string>,
  item: string,
  itemExisting: boolean,
): Array<string> {
  if (itemExisting) {
    // then filter it out!
    return items.filter((i) => item != i);
  } else {
    return [...items, item];
  }
}

function EditTags(props: Props & EditableProps) {
  const allTags = merge(props.allTags, props.tags).sort();
  const ref = useRef<HTMLInputElement>(null);
  let batchTags = allTags.map((t) => {
    const existingTag = props.tags.includes(t);
    const color = existingTag ? `text-black` : `text-gray-400`;
    return (
      <p
        onClick={() => props.onSetTags(toggle(props.tags, t, existingTag))}
        className={`bg-white cursor-pointer ${color}`}
      >
        #{t}
      </p>
    );
  });
  return (
    <div className={"flex flex-row gapx-2ch py-1lhch flex-wrap"}>
      {batchTags}
      <div>
        <input
          type={"text"}
          placeholder={"New tag"}
          className={"border-2 px-2ch"}
          ref={ref}
        />
        <Button
          label={"Add"}
          className={"ml-2ch"}
          onClick={() => {
            if (ref.current) {
              const tag = ref.current.value;
              props.onSetTags([...props.tags, tag]);
            }
          }}
        />
      </div>
    </div>
  );
}

export function EditableTag(props: Props & AllOrNothing<EditableProps>) {
  if (props.editing) {
    return <EditTags {...props} />;
  } else {
    return <Tags tags={props.tags} />;
  }
}

export interface TaggedItem {
  id: number;
  name: string;
  tags: string[];
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
        cell: (cell) => <td className={"px-2ch py-1lh"}>{cell.row.original.name}</td>,
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
                className={`bg-white border-2 px-2ch mr-2ch ${color}`}
              >
                {t}
              </span>
            );
          });
          let ownTags = ingredient.tags.map((t) => {
            return <span className={`bg-white border-2 px-2ch mr-2ch`}>{t}</span>;
          });
          return (
            <td className={"px-2ch py-1lh flex flex-row gapx-2ch py-1lhch flex-wrap"}>
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
          <th className={"px-2ch py-1lh"}>Name</th>
          <th className={"px-2ch py-1lh"}>Tags</th>
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
