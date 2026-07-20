import {
  type Shoppinglist,
  useShoppinglists,
} from "../../api/v1/shoppinglists.ts";
import { Popup } from "../popup.tsx";

type ShoppinglistIdentifier = Pick<Shoppinglist, "id" | "name">;

type Props = {
  onSelect: (id: ShoppinglistIdentifier) => void;
  label?: string;
};

export function AddToShoppinglist(props: Props) {
  const label = props.label || "Add";

  return (
    <Popup>
      <Popup.OpenButton
        label={label}
        className="px-1ch text-black bg-gray-300 shadow"
      />
      <Popup.Pane>
        <PickShoppinglist
          onSelect={(id) => {
            props.onSelect(id);
          }}
        />
      </Popup.Pane>
    </Popup>
  );
}

export function PickShoppinglist(props: Props) {
  const { isLoading, data } = useShoppinglists();

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const shoppinglists = data.shoppinglists.slice(0, 5);

  return (
    <ol className={"space-y-1lh"}>
      {shoppinglists.map((list) => (
        <li key={list.id}>
          <Popup.CloseButton
            label={list.name}
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list);
            }}
            className={"px-2ch bg-white shadow"}
          />
        </li>
      ))}
    </ol>
  );
}
