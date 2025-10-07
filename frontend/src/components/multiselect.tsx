import { useForm } from "@tanstack/react-form";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "./button.tsx";
import { ButtonGroup } from "./buttonGroup.tsx";
import { Divider } from "./divider.tsx";
import { Popup } from "./popup.tsx";

type Props = {
  label: string;
  className?: string;
  items: string[];
  selected?: string[];
  onItemsSelected: (items: string[]) => void;
  onNewItem?: (value: string) => void;
  newItemPlaceholder?: string;
};

export function MultiSelect(props: Props) {
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
    },
  });

  return (
    <Popup>
      <Popup.OpenButton
        label={props.label}
        className={props.className}
        type={"button"}
      />
      <Popup.Pane>
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
                  className={"bg-white border-2 border-solid border-black px-2"}
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
            <Popup.CloseButton
              label="Save"
              type="submit"
              onClick={() => {
                void form.handleSubmit();
              }}
            />
            <Button
              label={"Reset"}
              type="button"
              onClick={() => {
                form.reset();
              }}
            />
          </ButtonGroup>
        </div>
      </Popup.Pane>
    </Popup>
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
