import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useTags } from "../apis/tags.ts";
import { useLogin, useLogout, useUser } from "../apis/user.ts";

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
    validatorAdapter: zodValidator,
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
                <em>{emailField.state.meta.errorMap.onBlur}</em>
              ) : null}
            </div>
          )}
        />
        <form.Field
          name="password"
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
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => (
            <button
              className={"px-2"}
              type={"submit"}
              id={"submit"}
              disabled={!canSubmit}
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
  const tags = useTags(props.token);
  console.log(tags);
  if (!tags.data) {
    return undefined;
  }
  tags.data.sort((a, b) => {
    if (a.order && b.order) {
      return a.order - b.order;
    }

    return a.order === null ? 1 : -1;
  });

  return (
    <div>
      <h2>Tags</h2>
      <table className={"table-auto mt-2"}>
        <thead>
          <tr>
            <th className={"pr-2 text-left"}>Name</th>
            <th className={"pr-2 text-left"}>Order</th>
            <th className={"pr-2 text-left"}>Is aisle</th>
          </tr>
        </thead>
        <tbody>
          {tags.data.map((t) => (
            <tr key={t.name}>
              <td className={"pr-2"}>{t.name}</td>
              <td className={"pr-2"}>{t.order || ""}</td>
              <td className={"pr-2"}>
                <input
                  type={"checkbox"}
                  className={"px-2 bg-white shadow"}
                  defaultChecked={t.is_aisle}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
