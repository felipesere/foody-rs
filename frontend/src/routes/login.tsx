import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useLogin } from "../models/api.ts";

const RedirectAfterLoginSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: RedirectAfterLoginSchema,
});

export function LoginPage() {
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
      <form.Provider>
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
      </form.Provider>
    </div>
  );
}
