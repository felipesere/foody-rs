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
  onItemsSelected: (item: string | null) => void;
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
    onSubmit: ({ value }) => {
      props.onItemsSelected(value.selected);
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
            <div key={form.state.values.selected} id="multiselect">
              <ol className={"space-y-2"}>
                <form.Subscribe
                  selector={(state) => [state.values.selected]}
                  children={([selected]) => {
                    return (
                      <form.Field
                        name={"items"}
                        children={(itemsField) => {
                          return itemsField.state.value.map((item, idx) => (
                            <form.Field
                              key={item}
                              name={`items[${idx}]`}
                              children={() => {
                                const [first, ...remaining] = item;
                                return (
                                  <div
                                    className={"flex flex-row gap-2"}
                                    key={item}
                                  >
                                    <input
                                      type={"radio"}
                                      name={`${props.label}-selection`}
                                      className={"px-2 bg-white shadow"}
                                      id={item}
                                      key={item}
                                      checked={item === selected}
                                      onClick={() => {
                                        form.setFieldValue(
                                          "selected",
                                          item === selected ? null : item,
                                        );
                                      }}
                                      readOnly={true}
                                    />
                                    <label
                                      className={"no-colon"}
                                      htmlFor={item}
                                    >
                                      <span className={"font-bold"}>
                                        {first}
                                      </span>
                                      {remaining.join("")}
                                    </label>
                                  </div>
                                );
                              }}
                            />
                          ));
                        }}
                      />
                    );
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
