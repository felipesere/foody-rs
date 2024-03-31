import { useForm } from "@tanstack/react-form";
import type { FieldApi } from "@tanstack/react-form";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  useAllShoppinglists,
  useCreateShoppinglist,
} from "../apis/shoppinglists.ts";

export const Route = createFileRoute("/_auth/")({
  component: ShoppingPage,
});

export function ShoppingPage() {
  const { token } = Route.useRouteContext();
  const data = useAllShoppinglists(token);

  return (
    <div className="content-grid space-y-4">
      <NewShoppinglist token={token} />
      <ul className="grid max-w-md gap-4">
        {!data.data || data.isLoading
          ? "Loading"
          : data.data.shoppinglists.map((list) => (
              <Shoppinglist key={list.name} list={list} />
            ))}
      </ul>
    </div>
  );
}

function NewShoppinglist(props: { token: string }) {
  const createNewShoppinglist = useCreateShoppinglist(props.token);
  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      console.log(`submitting data: ${value.name}`);
      await createNewShoppinglist.mutateAsync(value);
      void form.reset();
    },
  });
  return (
    <form
      className={"flex flex-row"}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name={"name"}
        children={(field) => (
          <>
            <input
              placeholder={"New shoppinglist"}
              type={"text"}
              className={"p-2 outline-0 border-black border-2 border-solid"}
              name={field.name}
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </>
        )}
      />
      <button
        className={"px-2 ml-2 bg-gray-300 shadow"}
        type={"submit"}
        id={"submit"}
      >
        Create
      </button>
    </form>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.touchedErrors ? (
        <em>{field.state.meta.touchedErrors}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
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
