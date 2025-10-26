import { useForm } from "@tanstack/react-form";
import { useAllAisles, useCreateAisle } from "../../apis/aisles.ts";
import { type Ingredient, useEditIngredient } from "../../apis/ingredients.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { Button } from "../button.tsx";
import { ButtonGroup } from "../buttonGroup.tsx";
import { Divider } from "../divider.tsx";
import { InputWithButton } from "../inputWithButton.tsx";
import { Popup } from "../popup.tsx";

export function SelectAisle(props: {
  token: string;
  ingredientId: Ingredient["id"];
  currentAisle: string | null;
  shoppinglistId?: Shoppinglist["id"];
}) {
  const aisles = useAllAisles(props.token);
  // const setAisle = useSetIngredientAisle(props.token, props.ingredientId);

  const editIngredient = useEditIngredient(props.token);
  const newAisle = useCreateAisle(props.token);

  if (!aisles.data || aisles.error) {
    return <p>Loading...</p>;
  }

  return (
    <InnerSelectAisle
      items={aisles.data.map((a) => a.name)}
      selected={props.currentAisle}
      onItemsSelected={(item) =>
        editIngredient.mutate({
          id: props.ingredientId,
          changes: [{ type: "aisle", value: item }],
        })
      }
      onNewItem={(item) => {
        newAisle.mutate({ name: item });
      }}
    />
  );
}

function InnerSelectAisle(props: Props) {
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
      <Popup.OpenButton label={"Select Aisle"} />
      <Popup.Pane>
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
        <div className={"space-y-2"}>
          <InputWithButton
            label={"+"}
            placeholder={"New aisle..."}
            onSubmit={props.onNewItem}
          />
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
  onNewItem: (item: string) => void;
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
