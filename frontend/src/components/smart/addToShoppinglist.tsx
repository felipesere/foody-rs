import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { useAllShoppinglists } from "../../apis/shoppinglists.ts";
import { Popup } from "../popup.tsx";

type ShoppinglistIdentifier = Pick<Shoppinglist, "id" | "name">;

type Props = {
  token: string;
  onSelect: (id: ShoppinglistIdentifier) => void;
  label?: string;
};

export function AddToShoppinglist(props: Props) {
  const label = props.label || "Add";

  return (
    <Popup>
      <Popup.OpenButton
        label={label}
        className="px-2 text-black bg-gray-300 shadow"
      />
      <Popup.Pane>
        <PickShoppinglist
          token={props.token}
          onSelect={(id) => {
            props.onSelect(id);
          }}
        />
      </Popup.Pane>
    </Popup>
  );
}

export function PickShoppinglist(props: Props) {
  const { isLoading, data } = useAllShoppinglists(props.token);

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const shoppinglists = data.shoppinglists.slice(0, 5);

  return (
    <ol className={"space-y-2"}>
      {shoppinglists.map((list) => (
        <li key={list.id}>
          <Popup.CloseButton
            label={list.name}
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list);
            }}
            className={"px-2 bg-white shadow"}
          />
        </li>
      ))}
    </ol>
  );
}
