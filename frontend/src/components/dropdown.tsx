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
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import classNames from "classnames";
import Fuse from "fuse.js";
import { forwardRef, useMemo, useRef, useState } from "react";
import type { ChangeEvent, HTMLProps, ReactNode } from "react";
import type { Ingredient } from "../apis/ingredients.ts";

const matchWidth = size({
  apply({ rects, elements }) {
    Object.assign(elements.floating.style, {
      width: `${rects.reference.width}px`,
    });
  },
});

interface DropdownProps {
  items: Array<Ingredient>;
  dropdownClassnames?: string;
  onSelectedItem: (item: Ingredient) => void;
}

export const Dropdown = forwardRef<HTMLInputElement, DropdownProps>(
  function MyDropdown(props, ref) {
    const [open, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const listRef = useRef<Array<HTMLElement | null>>([]);

    const searchIndex = useMemo(() => {
      return new Fuse(props.items, {
        shouldSort: true,
        threshold: 0.3,
        keys: ["name"],
      });
    }, [props.items]);

    const items = searchIndex.search(query).map((r) => r.item);

    const changeActiveItem = (idx: number | null) => {
      // TODO: Possible bug: we never really say "no item is selected",
      // but we don't control _when_ changeActiveItem is called (up to float-ui).
      // We want to avoid "spamming" `onSelectedItem` with `nulls`
      setActiveIndex(idx);
      if (idx != null && items[idx]) {
        props.onSelectedItem(items[idx]);
      }
    };

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
      onNavigate: changeActiveItem,
      virtual: true,
      loop: true,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } =
      useInteractions([role, dismiss, listNav]);

    function onChange(event: ChangeEvent<HTMLInputElement>) {
      const value = event.target.value;
      setQuery(value);
      if (value.length > 2) {
        setIsOpen(true);
        changeActiveItem(0);
      } else {
        setIsOpen(false);
      }
    }

    const mergedRefs = useMergeRefs([refs.setReference, ref]);

    return (
      <>
        <input
          {...getReferenceProps({
            className: props.dropdownClassnames || "",
            ref: mergedRefs,
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
                setQuery(items[activeIndex].name);
                changeActiveItem(null);
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
                        setQuery(item.name);
                        setIsOpen(false);
                        refs.domReference.current?.focus();
                      },
                    })}
                    active={activeIndex === idx}
                  >
                    {item.name}
                  </Item>
                ))}
              </ul>
            </FloatingFocusManager>
          )}
        </FloatingPortal>
      </>
    );
  },
);

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
