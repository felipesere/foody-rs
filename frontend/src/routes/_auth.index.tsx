import type { AnyFieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  useAllShoppinglists,
  useCreateShoppinglist,
  useRemoveShoppinglist,
} from "../apis/shoppinglists.ts";
import { KebabMenu } from "../components/kebabMenu.tsx";

export const Route = createFileRoute("/_auth/")({
  component: ShoppingPage,
});

export function ShoppingPage() {
  const { token } = Route.useRouteContext();
  const data = useAllShoppinglists(token);

  return (
    <div className="content-grid space-y-2lh">
      <NewShoppinglist token={token} />
      <ul className="grid max-w-md gap-x-1ch gap-y-1lh">
        {!data.data || data.isLoading
          ? "Loading"
          : data.data.shoppinglists
              .sort(
                (a, b) => b.last_updated.getTime() - a.last_updated.getTime(),
              )
              .map((list) => (
                <Shoppinglist key={list.name} list={list} token={token} />
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
        validators={{
          onBlur: z.string().min(1),
        }}
        children={(field) => (
          <>
            <input
              placeholder={"New shoppinglist"}
              type={"text"}
              className={
                "px-1ch py-0.5lh outline-0 border-black border-2 border-solid"
              }
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

      <form.Subscribe
        selector={(state) => [state.canSubmit]}
        children={([canSubmit]) => (
          <button
            className={"px-1ch ml-1ch bg-gray-300 shadow"}
            type={"submit"}
            id={"submit"}
            disabled={!canSubmit}
          >
            Create
          </button>
        )}
      />
    </form>
  );
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

function Shoppinglist({
  list,
  token,
}: {
  list: { name: string; id: number };
  token: string;
}) {
  const removeShoppinglist = useRemoveShoppinglist(token);
  return (
    <li className="flex flex-row justify-between shadow border-black border-solid border-2 px-1ch py-0.5lh col-span-2">
      <Link
        to={"/shoppinglist/$shoppinglistId"}
        params={{ shoppinglistId: list.id.toString() }}
        className={"block capitalize ml-1ch font-black tracking-wider"}
      >
        {list.name}
      </Link>
      <KebabMenu>
        <KebabMenu.Button
          value={"Delete"}
          style={"dark"}
          onClick={() => removeShoppinglist.mutate({ id: list.id })}
        />
      </KebabMenu>
    </li>
  );
}
