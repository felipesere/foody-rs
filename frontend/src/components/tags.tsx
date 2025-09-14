import { useRef } from "react";
import { Button } from "./button.tsx";

export function Tags(props: { tags: string[] }) {
  return (
    <ol className={"flex flex-row flex-wrap gap-2"}>
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
    <div className={"flex flex-row gap-2 flex-wrap"}>
      {batchTags}
      <div>
        <input
          type={"text"}
          placeholder={"New tag"}
          className={"border-2 px-2"}
          ref={ref}
        />
        <Button
          label={"Add"}
          className={"ml-2"}
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
