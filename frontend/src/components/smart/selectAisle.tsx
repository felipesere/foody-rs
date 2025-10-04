import { useAllAisles, useCreateAisle } from "../../apis/aisles.ts";
import {
  type Ingredient,
  useSetIngredientAisle,
} from "../../apis/ingredients.ts";
import type {Shoppinglist} from "../../apis/shoppinglists.ts";
import {useField, useForm} from "@tanstack/react-form";
import {Button} from "../button.tsx";
import {Divider} from "../divider.tsx";
import {ButtonGroup} from "../buttonGroup.tsx";
import {useId} from "@floating-ui/react";
import classNames from "classnames";
import { InputWithButton } from "../inputWithButton.tsx";

export function SelectAisle(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentAisle: string | null;
  shoppinglistId?: Shoppinglist["id"];
}) {
  const aisles = useAllAisles(props.token);
  const setAisle = useSetIngredientAisle(props.token, props.ingredientId);
  const newAisle = useCreateAisle(props.token);

  if (!aisles.data || aisles.error) {
    return <p>Loading...</p>;
  }

  return (
    <NewSingleSelect
      label={"Select aisle"}
      items={aisles.data.map((a) => a.name)}
      selected={props.currentAisle}
      onItemsSelected={(item) => setAisle.mutate({ aisle: item })}
      onNewItem={(item) => {
        console.log(item);
        newAisle.mutate({ name: item });
      }}
    />
  );
}

type Props = {
  label: string;
  className?: string;
  items: string[];
  selected: string | null;
  onItemsSelected: (item: string | null) => void;
  onNewItem: (item: string) => void;
  hotkey?: string;
};

function NewSingleSelect(props: Props) {
    const id = useId();
    const form = useForm({
        defaultValues: {
            items: props.items,
            selected: props.selected,
        },
        onSubmit: ({value}) => {
            props.onItemsSelected(value.selected);
        },
    });

    const itemsField = useField({
        form,
        name: "items"
    });

    return (
        <div className={"new-single-select-pane"}>
            <Button
                popoverTarget={id}
                label={props.label}
                className={classNames(props.className, "new-single-select-button")}
                type={"button"}
                hotkey={props.hotkey}
            />
            <div
                id={id}
                popover={"auto"}
                tabIndex={-1}
                className={"bg-gray-100 p-2 border-solid border-black border-2 z-50 new-single-select"}
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
                                                        const isChecked = item === selected;
                                                        const onClick = () => {
                                                            form.setFieldValue(
                                                                "selected",
                                                                isChecked ? null : item,
                                                            );
                                                        }
                                                        return (<Choice item={item} isChecked={isChecked}
                                                                        onClick={onClick}/>)
                                                    }}
                                                />
                                            ));
                                        }}
                                    />
                                );
                            }}
                        />
                    </ol>
                    <Divider/>
                    <div className={"space-y-2"}>
                        <InputWithButton label={"+"} placeholder={"New aisle..."} onSubmit={(item) => {
                            itemsField.pushValue(item)
                        }}/>
                        <ButtonGroup>
                            <Button
                                popoverTarget={id}
                                popoverTargetAction={"hide"}
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
            </div>
        </div>
      </div>
    </div>
  );
}

function Choice({
  item,
  isChecked,
  onClick,
}: {
  item: string;
  isChecked: boolean;
  onClick: () => void;
}) {
  const [first, ...remaining] = item;
  return (
    <li className={"flex flex-row gap-2"} key={item}>
      <input
        type={"radio"}
        className={"bg-white shadow w-5 h-5"}
        id={item}
        key={item}
        checked={isChecked}
        onClick={onClick}
        readOnly={true}
      />
      <label className={"no-colon"} htmlFor={item}>
        <span className={"font-bold"}>{first}</span>
        {remaining.join("")}
      </label>
    </li>
  );
}
