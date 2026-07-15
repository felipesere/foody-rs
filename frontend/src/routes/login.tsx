import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { toast } from "sonner";
import * as v from "valibot";
import { type Aisle, useAisles, useUpdateAisle } from "../api/v1/aisles.ts";
import { importErrorMessage, useImport } from "../api/v1/import.ts";
import { type Ingredient, useMergeIngredients } from "../api/v1/ingredient.ts";
import {
  login,
  meQueryOptions,
  type User,
  useLogout,
} from "../api/v1/session.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { Pill } from "../components/pill.tsx";
import { FindIngredient } from "../components/smart/findIngredient.tsx";

const RedirectAfterLoginSchema = v.object({
  redirect: v.optional(v.string()),
});

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: RedirectAfterLoginSchema,
});

export function LoginPage() {
  const me = useQuery(meQueryOptions());
  return (
    <div className="content-grid">
      {me.data ? <UserDetails user={me.data} /> : <Login />}
    </div>
  );
}

function UserDetails(props: { user: User }) {
  const logout = useLogout();

  return (
    <div className={"content-grid gap-4ch"}>
      <div>
        <p>
          Hello, <span className={"capitalize"}>{props.user.name}</span>!
        </p>
        <button
          className={"px-2ch"}
          type={"button"}
          onClick={async () => {
            await logout();
          }}
        >
          Sign out
        </button>
      </div>
      <AdminPanel />
    </div>
  );
}

function Login() {
  return (
    <div className="content-grid space-y-1lh">
      <h3>Login</h3>
      <p>Sign in with your Pocket ID passkey.</p>
      <button
        className={"px-2ch"}
        type={"button"}
        id={"submit"}
        onClick={() => login()}
      >
        Sign in
      </button>
    </div>
  );
}

function AdminPanel() {
  const aisles = useAisles();

  if (!aisles.data) {
    return <p>Loading aisles...</p>;
  }

  return (
    <div className={"flex flex-col gap-4ch"}>
      <Divider />
      <EditAislesForm aisles={aisles.data.aisles} />
      <Divider />
      <MergeIngredients />
      <Divider />
      <ImportData />
    </div>
  );
}

function ImportData() {
  const doImport = useImport();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    onSubmit: async ({ value: { file } }) => {
      if (!file) return;
      try {
        const { imported } = await doImport.mutateAsync(file);
        toast.success(
          `Imported ${imported.aisles} aisles, ` +
            `${imported.ingredients} ingredients, ` +
            `${imported.recipes} recipes, ` +
            `${imported.mealplans} meal plans, ` +
            `${imported.shoppinglists} shopping lists`,
        );
        form.reset();
        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        toast.error(await importErrorMessage(err));
      }
    },
  });

  return (
    <div>
      <h2>Import data</h2>
      <p>Upload a JSON export to add it to this group's data.</p>
      <form
        id={"import"}
        className={"flex flex-col gap-2ch items-start mt-1lh"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name={"file"}
          children={(fieldApi) => (
            <input
              ref={inputRef}
              id={"import-file"}
              type={"file"}
              accept={"application/json,.json"}
              onChange={(e) =>
                fieldApi.handleChange(e.target.files?.[0] ?? null)
              }
            />
          )}
        />
        <form.Subscribe
          selector={(state) => [state.values.file, state.isSubmitting]}
          children={([file, isSubmitting]) => (
            <ButtonGroup>
              <Button
                label={isSubmitting ? "Importing..." : "Import"}
                type={"submit"}
                disabled={!file || Boolean(isSubmitting)}
              />
            </ButtonGroup>
          )}
        />
      </form>
    </div>
  );
}

function EditAislesForm(props: { aisles: Aisle[] }) {
  const updateAisle = useUpdateAisle();

  const form = useForm({
    defaultValues: {
      aisles: Object.values(props.aisles),
    },
    onSubmit: async ({ value: { aisles } }) => {
      await Promise.all(
        aisles.map((aisle) =>
          updateAisle.mutateAsync({
            id: aisle.id,
            name: aisle.name,
            order: aisle.order,
          }),
        ),
      );
      toast.success("Saved aisle order");
    },
  });

  return (
    <div>
      <h2>Aisles</h2>

      <form
        id="aisles"
        className={"grid gap-4ch"}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <table className={"table-auto border-collapse mt-1lh"}>
          <thead>
            <tr>
              <th className={"pr-4ch text-left border-black border-r-2"}>
                Name
              </th>
              <th className={"px-4ch text-left"}>Order</th>
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
                      <td className={"pr-4ch border-black border-r-2"}>
                        {aisle.name}
                      </td>
                      <td className={"px-4ch"}>
                        <form.Field
                          name={`aisles[${idx}].order`}
                          children={(orderField) => (
                            <input
                              type={"number"}
                              value={orderField.state.value as number}
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
          <Button label={"Save"} type={"submit"} />
        </ButtonGroup>
      </form>
    </div>
  );
}

function MergeIngredients() {
  const mergeIngredients = useMergeIngredients();

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
              <div className={"flex flex-row gap-4ch"}>
                <div className={"flex flex-row"}>
                  <p>Ingredients to merge:</p>
                  <FindIngredient
                    placeholder={"ingredient to merge..."}
                    onIngredient={(i) => fieldApi.pushValue(i)}
                  />
                </div>
                <ul className={"flex flex-row gapx-2ch py-1lhch"}>
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
            <div className={"flex flex-row gapx-2ch py-1lhch"}>
              <p>Merge into</p>
              {fieldApi.state.value === null ? (
                <FindIngredient
                  placeholder={"merge into..."}
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
                className={"px-2ch"}
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
