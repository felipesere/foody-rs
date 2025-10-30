import { useForm } from "@tanstack/react-form";
import { type Ingredient, useEditIngredient } from "../../apis/ingredients.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { useAllStorages } from "../../apis/storage.ts";
import { Button } from "../button.tsx";
import { ButtonGroup } from "../buttonGroup.tsx";
import { Divider } from "../divider.tsx";
import { Popup } from "../popup.tsx";

export function SelectStoredIn(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentStoredIn: string | null;
  shoppinglistId?: Shoppinglist["id"];
}) {
  const storages = useAllStorages(props.token);
  const editIngredient = useEditIngredient(props.token);

  if (!storages.data || storages.error) {
    return <p>Loading...</p>;
  }

  return (
    <InnerSelectStorage
      items={storages.data.map((a) => a.name)}
      selected={props.currentStoredIn}
      onItemsSelected={(item) => {
        let storage = storages.data?.find((s) => s.name === item);
        let value = storage?.id ?? null;
        editIngredient.mutate({
          id: props.ingredientId,
          changes: [{ type: "storedin", value }],
        });
      }}
    />
  );
}

function InnerSelectStorage(props: Props) {
  const form = useForm({
    defaultValues: {
      items: props.items,
      selected: props.selected,
    },
    onSubmit: ({ value }) => {
      props.onItemsSelected(value.selected);
    },
  });

  return (
    <Popup>
      <Popup.OpenButton label={"Stored-in"} />
      <Popup.Pane>
        <ol className={"space-y-1lh"}>
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
                          };
                          return (
                            <Choice
                              item={item}
                              isChecked={isChecked}
                              onClick={onClick}
                            />
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
        <div className={"space-y-1lh"}>
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

type Props = {
  items: string[];
  selected: string | null;
  onItemsSelected: (item: string | null) => void;
};

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
    <li className={"flex flex-row gap-2ch"} key={item}>
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
