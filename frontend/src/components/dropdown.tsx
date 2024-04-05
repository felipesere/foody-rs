import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  offset,
  size,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import classNames from "classnames";
import Fuse from "fuse.js";
import { forwardRef, useMemo, useRef, useState } from "react";
import type { ChangeEvent, HTMLProps, ReactNode } from "react";

const matchWidth = size({
  apply({ rects, elements }) {
    Object.assign(elements.floating.style, {
      width: `${rects.reference.width}px`,
    });
  },
});

interface WithId {
  id: string | number;
}

interface DropdownProps<T extends WithId, F extends keyof T> {
  items: Array<T>;
  field: F;
  dropdownClassnames?: string;
}

export function Dropdown<T extends WithId, F extends keyof T>(
  props: DropdownProps<T, F>,
) {
  const [open, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const searchIndex = useMemo(() => {
    return new Fuse(props.items, {
      shouldSort: true,
      threshold: 0.3,
      keys: [props.field.toString()],
    });
  }, [props.items, props.field]);

  const { refs, floatingStyles, context } = useFloating<HTMLElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setIsOpen,
    middleware: [matchWidth, offset(3)],
  });

  const role = useRole(context);
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav],
  );

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    if (value.length > 2) {
      setIsOpen(true);
      setActiveIndex(0);
    } else {
      setIsOpen(false);
    }
  }

  const items = searchIndex.search(query).map((r) => r.item);

  return (
    <>
      <input
        {...getReferenceProps({
          className: props.dropdownClassnames || "",
          ref: refs.setReference,
          onChange,
          value: query,
          placeholder: "ingredient...",
          "aria-autocomplete": "list",
          onKeyDown(event) {
            if (
              event.key === "Enter" &&
              activeIndex != null &&
              items[activeIndex]
            ) {
              setQuery(`${items[activeIndex][props.field]}`);
              setActiveIndex(null);
              setIsOpen(false);
            }
          },
        })}
      />
      <FloatingPortal>
        {open && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <ul
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  ...floatingStyles,
                },
                className:
                  "bg-white overflow-y-auto border-solid border-black border-2",
              })}
            >
              {items.map((item, idx) => (
                <Item
                  {...getItemProps({
                    key: item.id,
                    ref(node) {
                      listRef.current[idx] = node;
                    },
                    onClick() {
                      setQuery(`${item[props.field]}`);
                      setIsOpen(false);
                      refs.domReference.current?.focus();
                    },
                  })}
                  active={activeIndex === idx}
                >
                  {`${item[props.field]}`}
                </Item>
              ))}
            </ul>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
}

interface ItemProps {
  children: ReactNode;
  active: boolean;
}

const Item = forwardRef<HTMLLIElement, ItemProps & HTMLProps<HTMLLIElement>>(
  ({ children, active, ...rest }, ref) => {
    const id = useId();
    return (
      <li
        ref={ref}
        // role="option"
        id={id}
        aria-selected={active}
        {...rest}
        style={{
          ...rest.style,
        }}
        className={classNames("p-2 hover:bg-gray-300 cursor-default", {
          "bg-gray-300": active,
        })}
      >
        {children}
      </li>
    );
  },
);
