import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useForm } from "@tanstack/react-form";
import classnames from "classnames";
import { useState } from "react";
import { ButtonGroup } from "./buttonGroup.tsx";
import { Divider } from "./divider.tsx";
import { useHotkeys } from "react-hotkeys-hook";

// TODO: Cleanup props and come up with good API.
//       Make it look and behave similar to the `dropdown`
type Props = {
  token: string;
  label: string;
  className?: string;
  items: string[];
  selected?: string[];
  onItemsSelected: (items: string[]) => void;
  onNewItem?: (value: string) => void;
  newItemPlaceholder?: string;
};

export function MultiSelect(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(3), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true });
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  function isSelected(item: string) {
    return props.selected?.includes(item) || false;
  }

  const items = props.items.map((i) => ({
    name: i,
    value: isSelected(i),
  }));

  const form = useForm({
    defaultValues: {
      items,
    },
    onSubmit: (values) => {
      const selected = values.value.items
        .filter((i) => i.value)
        .map((i) => i.name);
      props.onItemsSelected(selected);
    },
  });

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="submit"
        className={classnames(
          props.className,
          "px-2 text-black bg-gray-300 shadow",
        )}
      >
        {props.label}
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={"bg-gray-100 p-2 border-solid border-black border-2"}
          >
            <form
              id="multiselect"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <ol className={"space-y-2"}>
                <form.Field
                  name={"items"}
                  children={(itemsField) => {
                    return itemsField.state.value.map((item, idx) => (
                      <form.Field
                        key={item.name}
                        name={`items[${idx}].value`}
                        children={(itemField) => {
                          const [first, ...remaining] = item.name;

                          useHotkeys(
                            [first],
                            () => {
                              console.log(`${first} was pressed...`);
                              console.log(
                                `The value in "useHotKeys" for ${
                                  item.name
                                } is: ${JSON.stringify(itemField.state.value)}`,
                              );
                              itemField.setValue((p) => !p, { touch: true });
                            },
                            {},
                            [itemField],
                          );

                          // console.log(`The value in "children" is: ${JSON.stringify(itemField.state)}`)

                          return (
                            <div
                              className={"flex flex-row gap-2"}
                              key={item.name}
                            >
                              <input
                                type={"checkbox"}
                                className={"px-2 bg-white shadow"}
                                id={item.name}
                                key={item.name}
                                defaultChecked={itemField.state.value}
                                onClick={() => {
                                  itemField.handleChange(
                                    !itemField.state.value,
                                  );
                                }}
                              />
                              <label className={"no-colon"} htmlFor={item.name}>
                                <span className={"font-bold"}>{first}</span>
                                {remaining.join("")}
                              </label>
                            </div>
                          );
                        }}
                      />
                    ));
                  }}
                />
                {props.onNewItem && (
                  <div className={"flex flex-row gap-2"} key={"new-item"}>
                    <input
                      type={"text"}
                      className={"border-2 border-solid border-black px-2"}
                      id={"new-item"}
                      placeholder={props.newItemPlaceholder || "New..."}
                      onBlur={(e) => {
                        if (e.target.value) {
                          props.onNewItem?.(e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
              </ol>
              <Divider />
              <ButtonGroup>
                <button
                  type="submit"
                  className="px-2 text-black bg-gray-300 shadow"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-2 text-black bg-gray-300 shadow"
                  onClick={() => {
                    form.reset();
                    console.log("...resetting...");
                  }}
                >
                  Reset
                </button>
              </ButtonGroup>
            </form>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
