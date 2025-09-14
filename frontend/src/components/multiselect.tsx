import {
  autoUpdate,
  FloatingFocusManager,
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
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "./button.tsx";
import { ButtonGroup } from "./buttonGroup.tsx";
import { Divider } from "./divider.tsx";

// TODO: Cleanup props and come up with good API.
//       Make it look and behave similar to the `dropdown`
type Props = {
  label: string;
  className?: string;
  items: string[];
  selected?: string[];
  onItemsSelected: (items: string[]) => void;
  onNewItem?: (value: string) => void;
  newItemPlaceholder?: string;
  hotkey?: string;
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

  const items = props.items.map((i) => ({
    name: i,
    value: props.selected?.includes(i) || false,
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
      setIsOpen(false);
    },
  });

  return (
    <>
      <Button
        setRef={refs.setReference}
        {...getReferenceProps()}
        label={props.label}
        className={props.className}
        type={"button"}
        hotkey={props.hotkey}
      />
      {isOpen && (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
          <div
            tabIndex={-1}
            ref={refs.setFloating}
            className={
              "bg-gray-100 p-2 border-solid border-black border-2 z-50 felipe-is-here"
            }
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <div id="multiselect">
              <ol className={"space-y-2"}>
                <form.Field
                  name={"items"}
                  children={(itemsField) => {
                    return itemsField.state.value.map((item, idx) => (
                      <form.Field
                        key={item.name}
                        name={`items[${idx}].value`}
                        children={(itemField) => {
                          function update() {
                            itemField.handleChange((p) => !p);
                          }
                          const name = item.name;
                          const checked: boolean = itemField.state.value;
                          return (
                            <Checkbox
                              name={name}
                              update={update}
                              checked={checked}
                            />
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
                      className={
                        "bg-white border-2 border-solid border-black px-2"
                      }
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
                <Button
                  label="Save"
                  type="submit"
                  hotkey="ctrl+s"
                  onClick={() => {
                    void form.handleSubmit();
                  }}
                />
                <Button
                  label={"Reset"}
                  hotkey={"ctrl+r"}
                  type="button"
                  onClick={() => {
                    form.reset();
                  }}
                />
              </ButtonGroup>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}

function Checkbox(props: {
  name: string;
  update: () => void;
  checked: boolean;
}) {
  const { name, update, checked } = props;
  const [first, ...remaining] = name;
  useHotkeys([first], update);

  return (
    <div className={"flex flex-row gap-2"} key={name}>
      <input
        type={"checkbox"}
        className={"px-2 bg-white shadow"}
        id={name}
        key={name}
        checked={checked}
        readOnly={true}
        onClick={update}
      />
      <label className={"no-colon"} htmlFor={name}>
        <span className={"font-bold"}>{first}</span>
        {remaining.join("")}
      </label>
    </div>
  );
}
