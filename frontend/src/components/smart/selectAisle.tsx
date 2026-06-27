import { useForm } from "@tanstack/react-form";
import { client as aisleClient } from "../../api/v1/aisles.ts";
import {
  Ingredient,
  client as ingredientsClient,
} from "../../api/v1/ingredient.ts";
import { Shoppinglist } from "../../api/v1/shoppinglists.ts";
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
  const aisles = aisleClient().index(props.token);
  const newAisle = aisleClient().create(props.token);
  const editIngredient = ingredientsClient().update(props.token);

  if (!aisles.data || aisles.error) {
    return <p>Loading Aisles...</p>;
  }

  return (
    <InnerSelectAisle
      items={aisles.data.aisles.map((a) => a.name)}
      selected={props.currentAisle}
      onItemsSelected={(item) => {
        console.log(item);
        editIngredient.mutate({
          ingredient_id: props.ingredientId,
          fields: {},
        });
      }}
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
        <ol className={"space-y-1lh max-h-96 overflow-scroll"}>
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
