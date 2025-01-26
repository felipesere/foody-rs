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
import { useState } from "react";
import { Button } from "./button.tsx";
import { ButtonGroup } from "./buttonGroup.tsx";
import { Divider } from "./divider.tsx";

// TODO: Cleanup props and come up with good API.
//       Make it look and behave similar to the `dropdown`
type Props = {
  label: string;
  className?: string;
  items: string[];
  selected: string | null;
  onItemsSelected: (item: string) => void;
  hotkey?: string;
};

export function SingleSelect(props: Props) {
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

  const form = useForm({
    defaultValues: {
      items: props.items,
      selected: props.selected,
    },
    onSubmit: (value) => {
      console.log(value);
      // const selected = value.value.items
      //   .filter((i) => i.value)
      //   .map((i) => i.name);
      // props.onItemsSelected(selected);
      setIsOpen(false);
    },
  });

  console.log(form.getFieldValue("selected"));

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
                        key={item}
                        name={`items[${idx}]`}
                        children={(itemField) => {
                          const [first, ...remaining] = item;
                          return (
                            <div className={"flex flex-row gap-2"} key={item}>
                              <input
                                type={"radio"}
                                name={`${props.label}-selection`}
                                className={"px-2 bg-white shadow"}
                                id={item}
                                key={item}
                                checked={
                                  itemField.state.value ===
                                  itemField.form.state.values.selected
                                }
                                onClick={() => {
                                  form.setFieldValue(
                                    "selected",
                                    (value) => {
                                      console.log(
                                        `Updating the form from ${item}...`,
                                      );
                                      console.log({ value });
                                      if (value) {
                                        return null;
                                      }
                                      return item;
                                    },
                                    { dontUpdateMeta: false },
                                  );
                                }}
                                readOnly={true}
                              />
                              <label className={"no-colon"} htmlFor={item}>
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
