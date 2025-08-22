import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
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
import type { ChangeEvent, HTMLProps, ReactNode } from "react";
import {
  type ForwardedRef,
  forwardRef,
  useMemo,
  useRef,
  useState,
} from "react";

const matchWidth = size({
  apply({ rects, elements }) {
    Object.assign(elements.floating.style, {
      width: `${rects.reference.width}px`,
    });
  },
});

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
  ref?: ForwardedRef<HTMLInputElement>;
}

export const Dropdown = forwardRef(InnerDropdown) as <T extends Named>(
  props: DropdownProps<T>,
) => ReturnType<typeof InnerDropdown>;

function InnerDropdown<T extends Named>(
  props: DropdownProps<T>,
  ref: ForwardedRef<HTMLInputElement>,
) {
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
    } else {
      setIsOpen(false);
    }
  }

  function handleBlur() {
    props.onBlur?.();
  }

  const mergedRefs = useMergeRefs([refs.setReference, ref]);

  return (
    <>
      <input
        {...getReferenceProps({
          className: props.dropdownClassnames || "",
          ref: mergedRefs,
          onChange,
          onBlur: handleBlur,
          value: query,
          placeholder: props.placeholder,
          "aria-autocomplete": "list",
          onKeyDown(event) {
            switch (event.key) {
              case "Enter":
                event.preventDefault();
                event.stopPropagation();
                break;
              case "Tab":
                break;
              default:
                return;
            }

            setIsOpen(false);
            // Not 100% sure about this...
            if (activeIndex === null) {
              props.onNewItem?.(query);
              return;
            }
            if (items[activeIndex]) {
              const item = items[activeIndex];
              setQuery(item.name);
              props.onSelectedItem(item);
            } else {
              props.onNewItem?.(query);
            }
          },
        })}
      />
      <FloatingPortal>
        {open && (
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            modal={false}
          >
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({
                className: "z-30 bg-white border-solid border-black border-2",
              })}
            >
              <ul>
                {items.map((item, idx) => (
                  <Item
                    {...getItemProps({
                      ref(node) {
                        listRef.current[idx] = node;
                      },
                      onClick() {
                        setQuery(item.name);
                        setIsOpen(false);
                        props.onSelectedItem(item);
                        refs.domReference.current?.focus();
                      },
                      onBlur: handleBlur,
                    })}
                    key={item.name}
                    active={activeIndex === idx}
                  >
                    {item.name}
                  </Item>
                ))}
                {query && props.onNewItem && (
                  <NewItem
                    ref={(node) => {
                      listRef.current[items.length] = node;
                    }}
                    active={activeIndex === items.length}
                    onClick={() => {
                      setQuery(query);
                      setIsOpen(false);
                      props.onNewItem?.(query);
                      refs.domReference.current?.focus();
                    }}
                    onBlur={handleBlur}
                  >
                    {query}
                  </NewItem>
                )}
              </ul>
            </div>
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

const NewItem = forwardRef<HTMLLIElement, ItemProps & HTMLProps<HTMLLIElement>>(
  ({ children, active, ...rest }, ref) => {
    const id = useId();
    return (
      <li
        ref={ref}
        id={id}
        aria-selected={active}
        {...rest}
        style={{
          ...rest.style,
        }}
        className={"p-1 striped-bg text-yellow-500 cursor-default"}
      >
        <div
          className={classNames("p-1 text-black hover:bg-gray-300", {
            "bg-white": !active,
            "bg-gray-300": active,
          })}
        >
          {children}
        </div>
      </li>
    );
  },
);
const Item = forwardRef<HTMLLIElement, ItemProps & HTMLProps<HTMLLIElement>>(
  ({ children, active, ...rest }, ref) => {
    const id = useId();
    return (
      <li
        ref={ref}
        id={id}
        aria-selected={active}
        {...rest}
        style={rest.style}
        className={classNames("p-2 hover:bg-gray-300 cursor-default", {
          "bg-gray-300": active,
        })}
      >
        {children}
      </li>
    );
  },
);
