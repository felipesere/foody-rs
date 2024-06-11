import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { type Tags, useAllTags } from "../apis/tags.ts";
import { useLogin, useLogout, useUser } from "../apis/user.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";

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
  const tags = useAllTags(props.token);

  if (!tags.data) {
    return <p>Loading tags...</p>;
  }

  return (
    <div>
      <EditTagsForm token={props.token} tags={tags.data} />
    </div>
  );
}

function EditTagsForm(props: { token: string; tags: Tags }) {
  const form = useForm({
    defaultValues: {
      tags: props.tags,
    },
    onSubmit: ({ value: { tags } }) => {
      console.log(`About to submit ${JSON.stringify(tags, null, 2)}`);
    },
  });

  return (
    <>
      <h2>Tags</h2>

      <form
        id="tags"
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
              <th className={"px-4 text-left border-black border-r-2"}>
                Is aisle
              </th>
              <th className={"px-4 text-left"}>Order</th>
            </tr>
          </thead>
          <tbody>
            <form.Field
              name={"tags"}
              mode={"array"}
              children={(tagsField) => {
                return tagsField.state.value.map((t, idx) => {
                  return (
                    <tr key={t.name}>
                      <td className={"pr-4 border-black border-r-2"}>
                        {t.name}
                      </td>
                      <td className={"px-4 border-black border-r-2"}>
                        <div>
                          <form.Field
                            name={`tags[${idx}].is_aisle`}
                            children={(isAisleField) => {
                              return (
                                <input
                                  name={isAisleField.name}
                                  type={"checkbox"}
                                  className={"px-2 bg-white shadow"}
                                  checked={isAisleField.state.value}
                                  readOnly={true}
                                  onClick={() =>
                                    isAisleField.handleChange((p) => !p)
                                  }
                                />
                              );
                            }}
                          />
                        </div>
                      </td>
                      <td className={"px-4"}>
                        <form.Subscribe
                          selector={(state) => [
                            state.values.tags[idx].is_aisle,
                          ]}
                          children={([is_aisle]) =>
                            is_aisle ? (
                              <form.Field
                                name={`tags[${idx}].order`}
                                children={(orderField) => (
                                  <input
                                    type={"number"}
                                    value={orderField.state.value}
                                    readOnly={true}
                                    onChange={(e) => {
                                      orderField.handleChange(+e.target.value);
                                    }}
                                  />
                                )}
                              />
                            ) : (
                              <></>
                            )
                          }
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
              form.pushFieldValue("tags", {
                name: "",
                is_aisle: false,
              })
            }
          />
        </ButtonGroup>
      </form>
    </>
  );
}
