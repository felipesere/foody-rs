import classNames from "classnames";
import Fuse from "fuse.js";
import type { ChangeEvent, CSSProperties, ReactNode, Ref } from "react";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";

interface Named {
  name: string;
}
export interface DropdownProps<T extends Named> {
  items: Array<T>;
  dropdownClassnames?: string;
  onSelectedItem: (item: T) => void;
  onNewItem?: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  ref?: Ref<HTMLInputElement>;
}

export function Dropdown<T extends Named>({ ref, ...props }: DropdownProps<T>) {
  const [open, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // A unique CSS anchor name links the input to its floating list so the
  // browser can position one against the other via CSS Anchor Positioning.
  const anchorName = `--dd-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const searchIndex = useMemo(() => {
    return new Fuse(props.items, {
      shouldSort: true,
      threshold: 0.3,
      keys: ["name"],
    });
  }, [props.items]);

  const items = searchIndex.search(query).map((r) => r.item);
  const showNewItem = Boolean(query) && Boolean(props.onNewItem);
  const optionCount = items.length + (showNewItem ? 1 : 0);

  // Move the floating list into the top layer once it is mounted. Guarded so
  // it is a no-op in environments without the Popover API (e.g. jsdom).
  useLayoutEffect(() => {
    if (open) {
      try {
        popoverRef.current?.showPopover?.();
      } catch {
        // already shown / not connected — nothing to do
      }
    }
  }, [open]);

  function setInputRef(node: HTMLInputElement | null) {
    inputRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    setActiveIndex(null);
    setIsOpen(value.length > 2);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(null);
  }

  // Resolve an option index (an item, or the "new item" row when the index is
  // out of the items range / null) and report it. Clicks refocus the input so
  // the user can keep typing; keyboard commits must not, so Tab can move away.
  function choose(index: number | null, refocus: boolean) {
    close();
    if (index !== null && index < items.length) {
      const item = items[index];
      setQuery(item.name);
      props.onSelectedItem(item);
    } else {
      props.onNewItem?.(query);
    }
    if (refocus) {
      inputRef.current?.focus();
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        if (!open || optionCount === 0) return;
        event.preventDefault();
        setActiveIndex((i) => (i === null ? 0 : (i + 1) % optionCount));
        return;
      case "ArrowUp":
        if (!open || optionCount === 0) return;
        event.preventDefault();
        setActiveIndex((i) =>
          i === null ? optionCount - 1 : (i - 1 + optionCount) % optionCount,
        );
        return;
      case "Escape":
        close();
        return;
      case "Enter":
        event.preventDefault();
        event.stopPropagation();
        choose(activeIndex, false);
        return;
      case "Tab":
        choose(activeIndex, false);
        return;
      default:
        return;
    }
  }

  function handleBlur() {
    props.onBlur?.();
  }

  return (
    <>
      <input
        ref={setInputRef}
        className={props.dropdownClassnames || ""}
        style={{ anchorName } as unknown as CSSProperties}
        value={query}
        placeholder={props.placeholder}
        onChange={onChange}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div
          ref={popoverRef}
          popover="auto"
          onToggle={(event) => {
            // Sync React state when the browser light-dismisses (click-away /
            // Escape) the popover.
            if ((event as unknown as ToggleEvent).newState === "closed") {
              close();
            }
          }}
          className="z-30 bg-white border-solid border-black border-2"
          style={
            {
              position: "fixed",
              positionAnchor: anchorName,
              top: `calc(anchor(bottom) + 3px)`,
              left: `anchor(left)`,
              width: `anchor-size(width)`,
              margin: 0,
            } as unknown as CSSProperties
          }
        >
          <ul>
            {items.map((item, idx) => (
              <Item
                key={item.name}
                active={activeIndex === idx}
                onClick={() => choose(idx, true)}
                onBlur={handleBlur}
              >
                {item.name}
              </Item>
            ))}
            {showNewItem && (
              <NewItem
                active={activeIndex === items.length}
                onClick={() => choose(items.length, true)}
                onBlur={handleBlur}
              >
                {query}
              </NewItem>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

interface ItemProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  onBlur: () => void;
}

function NewItem({ children, active, onClick, onBlur }: ItemProps) {
  return (
    <li
      onClick={onClick}
      onBlur={onBlur}
      className={"px-1ch py-0.5lh striped-bg text-yellow-500 cursor-default"}
    >
      <div
        className={classNames("px-1ch py-0.5lh text-black hover:bg-gray-300", {
          "bg-white": !active,
          "bg-gray-300": active,
        })}
      >
        {children}
      </div>
    </li>
  );
}

function Item({ children, active, onClick, onBlur }: ItemProps) {
  return (
    <li
      onClick={onClick}
      onBlur={onBlur}
      className={classNames("px-2ch py-1lh hover:bg-gray-300 cursor-default", {
        "bg-gray-300": active,
      })}
    >
      {children}
    </li>
  );
}
