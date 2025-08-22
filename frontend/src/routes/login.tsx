import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { type Aisle, useAllAisles } from "../apis/aisles.ts";
import { type Ingredient, useMergeIngredients } from "../apis/ingredients.ts";
import { useLogin, useLogout, useUser } from "../apis/user.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { Pill } from "../components/pill.tsx";
import { FindIngredient } from "../components/smart/findIngredient.tsx";

const RedirectAfterLoginSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: RedirectAfterLoginSchema,
});

export function LoginPage() {
  const { token } = Route.useRouteContext();
  return (
    <div className="content-grid">
      {token ? <UserDetails token={token} /> : <Login />}
    </div>
  );
}

function UserDetails(props: { token: string }) {
  const user = useUser(props.token);
  const logout = useLogout();

  const greeting = user.data ? (
    <p>
      Hello, <span className={"capitalize"}>{user.data.name}</span>!
    </p>
  ) : (
    <p>Hello!</p>
  );

  return (
    <div className={"content-grid gap-4"}>
      <div>
        {greeting}
        <button
          disabled={!user.data}
          className={"px-2"}
          type={"submit"}
          onClick={async () => {
            await logout();
          }}
        >
          Sign out
        </button>
      </div>
      <AdminPanel token={props.token} />
    </div>
  );
}

function Login() {
  const { redirect } = Route.useSearch();

  const login = useLogin({ redirectTo: redirect });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value);
    },
  });
  return (
    <div className="content-grid">
      <h3>Login</h3>
      <form
        className={"space-y-4"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onBlur: z.string().email(),
          }}
          children={(emailField) => (
            <div>
              <label className={"block"} htmlFor={emailField.name}>
                Username
              </label>
              <input
                type={"text"}
                className={"p-2 outline-0 border-black border-2 border-solid"}
                autoComplete={"username"}
                name={emailField.name}
                id={emailField.name}
                value={emailField.state.value}
                onBlur={emailField.handleBlur}
                onChange={(e) => emailField.handleChange(e.target.value)}
              />
              {emailField.state.meta.errorMap.onBlur ? (
                <em>
                  {emailField.state.meta.errorMap.onBlur
                    .map((error) => error.message)
                    .join(", ")}
                </em>
              ) : null}
            </div>
          )}
        />
        <form.Field
          name="password"
          validators={{
            onChange: (v) =>
              v.value.length === 0 ? "Password missing" : undefined,
          }}
          children={(passwordField) => (
            <div>
              <label className={"block"} htmlFor={passwordField.name}>
                Password
              </label>
              <input
                type={"password"}
                className={"p-2 outline-0 border-black border-2 border-solid"}
                autoComplete={"current-password"}
                name={passwordField.name}
                id={passwordField.name}
                value={passwordField.state.value}
                onChange={(e) => passwordField.handleChange(e.target.value)}
              />
            </div>
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
          children={([canSubmit, isPristine]) => (
            <button
              className={"px-2"}
              type={"submit"}
              id={"submit"}
              disabled={!canSubmit || isPristine}
            >
              Sign In
            </button>
          )}
        />
      </form>
    </div>
  );
}

function AdminPanel(props: { token: string }) {
  const aisles = useAllAisles(props.token);

  if (!aisles.data) {
    return <p>Loading aisles...</p>;
  }

  return (
    <div className={"flex flex-col gap-4"}>
      <Divider />
      <EditAislesForm token={props.token} aisles={aisles.data} />
      <Divider />
      <MergeIngredients token={props.token} />
    </div>
  );
}

function EditAislesForm(props: { token: string; aisles: Aisle[] }) {
  const form = useForm({
    defaultValues: {
      aisles: Object.values(props.aisles),
    },
    onSubmit: ({ value: { aisles } }) => {
      console.log(`About to submit ${JSON.stringify(aisles, null, 2)}`);
    },
  });

  return (
    <div>
      <h2>Aisles</h2>

      <form
        id="aisles"
        className={"grid gap-4"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <table className={"table-auto border-collapse mt-2"}>
          <thead>
            <tr>
              <th className={"pr-4 text-left border-black border-r-2"}>Name</th>
              <th className={"px-4 text-left"}>Order</th>
            </tr>
          </thead>
          <tbody>
            <form.Field
              name={"aisles"}
              mode={"array"}
              children={(aislesField) => {
                return aislesField.state.value.map((aisle, idx) => {
                  return (
                    <tr key={aisle.name}>
                      <td className={"pr-4 border-black border-r-2"}>
                        {aisle.name}
                      </td>
                      <td className={"px-4"}>
                        <form.Field
                          name={`aisles[${idx}].order`}
                          children={(orderField) => (
                            <input
                              type={"number"}
                              value={orderField.state.value as number}
                              readOnly={true}
                              onChange={(e) => {
                                orderField.handleChange(+e.target.value);
                              }}
                            />
                          )}
                        />
                      </td>
                    </tr>
                  );
                });
              }}
            />
          </tbody>
        </table>
        <ButtonGroup>
          <Button label={"Save"} type={"submit"} hotkey={"ctrl+s"} />
          <Button
            label={"Add row"}
            onClick={() =>
              form.pushFieldValue("aisles", {
                id: 1,
                name: "",
                order: 7,
              })
            }
          />
        </ButtonGroup>
      </form>
    </div>
  );
}

function MergeIngredients(props: { token: string }) {
  const mergeIngredients = useMergeIngredients(props.token);

  const form = useForm({
    defaultValues: {
      replace: [] as Ingredient[],
      target: null as Ingredient | null,
    },
    onSubmit: (values) => {
      const replace = values.value.replace.map((i) => i.id);
      const target = values.value.target?.id;
      if (target) {
        mergeIngredients.mutate({ replace, target });
        form.reset();
        const replaceNames = values.value.replace.map((i) => i.name);
        const targetName = values.value.target?.name || "unknown";
        toast.success(
          `Successfully merged ${replaceNames.join(", ")} into ${targetName}`,
        );
      }
    },
  });
  return (
    <div>
      <h2>Merge ingredients</h2>
      <form
        id={"mergeIngredient"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name={"replace"}
          mode={"array"}
          validators={{
            onChange: (v) =>
              v.value.length > 0
                ? undefined
                : "Need at least one ingredient to merge into",
          }}
          children={(fieldApi) => {
            return (
              <div className={"flex flex-row gap-4"}>
                <div className={"flex flex-row"}>
                  <p>Ingredients to merge:</p>
                  <FindIngredient
                    placeholder={"ingredient to merge..."}
                    token={props.token}
                    onIngredient={(i) => fieldApi.pushValue(i)}
                  />
                </div>
                <ul className={"flex flex-row gap-2"}>
                  {fieldApi.state.value.map((ingredient, idx) => (
                    <li key={ingredient.id}>
                      <Pill
                        value={ingredient.name}
                        onClose={() => fieldApi.removeValue(idx)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          }}
        />
        <form.Field
          name={"target"}
          validators={{
            onChange: (v) =>
              v === null ? "Need an ingredient to merge into" : undefined,
          }}
          children={(fieldApi) => (
            <div className={"flex flex-row gap-2"}>
              <p>Merge into</p>
              {fieldApi.state.value === null ? (
                <FindIngredient
                  placeholder={"merge into..."}
                  token={props.token}
                  onIngredient={(i) => fieldApi.handleChange(i)}
                />
              ) : (
                <Pill
                  value={fieldApi.state.value.name}
                  onClose={() => fieldApi.handleChange(null)}
                />
              )}
            </div>
          )}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isPristine]}
          children={([canSubmit, isPristine]) => {
            return (
              <button
                className={"px-2"}
                type={"submit"}
                id={"submit"}
                disabled={!canSubmit || isPristine}
              >
                Merge
              </button>
            );
          }}
        />
      </form>
    </div>
  );
}
