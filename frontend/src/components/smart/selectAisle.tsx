import { useForm } from "@tanstack/react-form";
import { Aisle, useAisles, useCreateAisle } from "../../api/v1/aisles.ts";
import { Ingredient, useUpdateIngredient } from "../../api/v1/ingredient.ts";
import { Shoppinglist } from "../../api/v1/shoppinglists.ts";
import { Button } from "../button.tsx";
import { ButtonGroup } from "../buttonGroup.tsx";
import { Divider } from "../divider.tsx";
import { InputWithButton } from "../inputWithButton.tsx";
import { Popup } from "../popup.tsx";

export function SelectAisle(props: {
  ingredientId: Ingredient["id"];
  currentAisle: Aisle | null;
  shoppinglistId?: Shoppinglist["id"];
}) {
  const aisles = useAisles();
  const newAisle = useCreateAisle();
  const editIngredient = useUpdateIngredient();

  if (!aisles.data || aisles.error) {
    return <p>Loading Aisles...</p>;
  }

  return (
    <InnerSelectAisle
      items={aisles.data.aisles}
      selected={props.currentAisle}
      onItemsSelected={(aisle) => {
        editIngredient.mutate({
          ingredient_id: props.ingredientId,
          fields: {
            aisle_id: aisle?.id,
          },
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
      <Popup.OpenButton label={"Select aisle"} />
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
                        key={item.id}
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
  items: Aisle[];
  selected: Aisle | null;
  onItemsSelected: (item: Aisle | null) => void;
  onNewItem: (item: string) => void;
};

function Choice({
  item,
  isChecked,
  onClick,
}: {
  item: Aisle;
  isChecked: boolean;
  onClick: () => void;
}) {
  const [first, ...remaining] = item.name;
  return (
    <li className={"flex flex-row gap-2ch"} key={item.id}>
      <input
        type={"radio"}
        className={"bg-white shadow w-5 h-5"}
        id={item.name}
        key={item.id}
        checked={isChecked}
        onClick={onClick}
        readOnly={true}
      />
      <label className={"no-colon"} htmlFor={item.name}>
        <span className={"font-bold"}>{first}</span>
        {remaining.join("")}
      </label>
    </li>
  );
}
