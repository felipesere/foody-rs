import { Link, createFileRoute } from "@tanstack/react-router";
import { useAllShoppinglists } from "../apis/shoppinglists.ts";

export const Route = createFileRoute("/_auth/")({
  component: ShoppingPage,
});

export function ShoppingPage() {
  const { token } = Route.useRouteContext();
  const data = useAllShoppinglists(token);

  return (
    <div className="content-grid">
      <ul className="grid max-w-md gap-4">
        {!data.data
          ? "Loading"
          : data.data.shoppinglists.map((list) => (
              <Shoppinglist key={list.name} list={list} />
            ))}
      </ul>
    </div>
  );
}

function Shoppinglist({ list }: { list: { name: string; id: number } }) {
  return (
    <li className="shadow border-black border-solid border-2 p-2 col-span-2">
      <Link
        to={"/shoppinglist/$shoppinglistId"}
        params={{ shoppinglistId: list.id.toString() }}
        className={"block capitalize ml-2 font-black tracking-wider"}
      >
        {list.name}
      </Link>
    </li>
  );
}
