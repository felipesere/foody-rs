import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type Recipe, useRecipe, useUpdateRecipe } from "../apis/recipes.ts";

import { useForm } from "@tanstack/react-form";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteRowButton } from "../components/deleteRowButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
import { ResizingInput } from "../components/resizeableInput.tsx";
import { humanize } from "../quantities.ts";

export const Route = createFileRoute("/_auth/recipes/$recipeId/edit")({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { recipeId } = Route.useParams();
  const { token } = Route.useRouteContext();
  const data = useRecipe(token, Number(recipeId));
  const navigate = useNavigate({ from: "/recipes/$recipeId/edit" });

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: () => navigate({ to: "/recipes" }),
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  if (data.isLoading || !data.data) {
    return <p>Loading...</p>;
  }

  return (
    <FloatingOverlay
      lockScroll
      className={
        "the-overlay-backdrop py-4 bg-black/25 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
      }
      style={{ margin: 0 }}
    >
      <FloatingFocusManager context={context}>
        <div
          ref={refs.setFloating}
          {...getFloatingProps({
            className:
              "m-2 p-4 bg-white w-full h-full max-w-2xl relative border-solid border-black border-2 space-y-4",
          })}
        >
          <EditRecipeFrom token={token} recipe={data.data} />
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
}

function EditRecipeFrom(props: { token: string; recipe: Recipe }) {
  const token = props.token;
  const recipe = props.recipe;
  const navigate = useNavigate({ from: "/recipes/$recipeId/edit" });
  const updateItem = useUpdateRecipe(props.token);

  const form = useForm({
    defaultValues: {
      name: recipe.name,
      id: recipe.id,
      source: recipe.source,
      title: recipe.source === "book" ? recipe.title : null,
      page: recipe.source === "book" ? recipe.page : null,
      url: recipe.source === "website" ? recipe.url : null,
      ingredients: recipe.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: humanize(i.quantity[0]),
      })),
    },
    onSubmit: async (vals) => {
      updateItem.mutate(vals.value);
      // void form.reset();
    },
  });

  return (
    <>
      <p className={"font-bold"}>Edit recipe</p>
      <form
        id="editRecipe"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <FieldSet legend={"Name"}>
          <form.Field
            name={"name"}
            children={(field) => (
              <ResizingInput
                name={"name"}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />
        </FieldSet>

        <FieldSet legend={"Kind of source"}>
          <form.Field
            name="source"
            children={(field) => (
              <>
                <div className="flex flex-row gap-1">
                  <input
                    type="radio"
                    id="book"
                    name="source"
                    value={"book"}
                    checked={field.state.value === "book"}
                    onChange={(_) => field.handleChange("book")}
                  />
                  <label htmlFor="book">Book</label>
                </div>
                <div className="flex flex-row gap-1">
                  <input
                    type="radio"
                    id="website"
                    name="source"
                    value="website"
                    checked={field.state.value === "website"}
                    onChange={() => field.handleChange("website")}
                  />
                  <label htmlFor="website">Website</label>
                </div>
              </>
            )}
          />
        </FieldSet>

        <form.Subscribe
          selector={(state) => [state.values.source]}
          children={([source]) => {
            if (source === "book") {
              return (
                <FieldSet legend={"Book"}>
                  <form.Field
                    name={"title"}
                    children={(field) => (
                      <div className={"flex flex-row gap-2"}>
                        <label>Title</label>
                        <ResizingInput
                          id={"bookTitle"}
                          name={"bookTitle"}
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  />

                  <form.Field
                    name={"page"}
                    children={(field) => (
                      <div className={"flex flex-row gap-2"}>
                        <label>Page</label>
                        <ResizingInput
                          id={"bookPage"}
                          name={"bookPage"}
                          value={field.state.value?.toString() || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value))
                          }
                        />
                      </div>
                    )}
                  />
                </FieldSet>
              );
            }
            if (source === "website") {
              return (
                <form.Field
                  name={"url"}
                  children={(field) => (
                    <FieldSet legend={"Website"}>
                      <div className={"flex flex-row gap-2"}>
                        <label>URL</label>
                        <ResizingInput
                          id={"url"}
                          name={"websiteUrl"}
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    </FieldSet>
                  )}
                />
              );
            }
          }}
        />

        <form.Field
          name="ingredients"
          mode={"array"}
          children={(ingredientsField) => {
            return (
              <FieldSet legend={"Ingredients"}>
                <ol>
                  {ingredientsField.state.value.map((ingredient, idx) => {
                    return (
                      <li
                        key={idx.toString()}
                        className={"flex flex-row justify-between"}
                      >
                        <DeleteRowButton
                          className={"text-red-700 mr-2"}
                          onClick={() => ingredientsField.removeValue(idx)}
                        />
                        <p>{ingredient.name}</p>
                        <DottedLine className={"flex-shrink"} />
                        <form.Field
                          name={`ingredients[${idx}].quantity`}
                          children={(field) => {
                            return (
                              <ResizingInput
                                name={"quantity"}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                            );
                          }}
                        />
                      </li>
                    );
                  })}

                  <FindIngredient
                    className={"mt-2"}
                    token={token}
                    onIngredient={(ingredient, quantity) => {
                      ingredientsField.pushValue({
                        name: ingredient.name,
                        id: ingredient.id,
                        quantity: humanize(quantity),
                      });
                    }}
                  />
                </ol>
              </FieldSet>
            );
          }}
        />
        <Divider />
        <ButtonGroup>
          <button
            type="button"
            className={"px-2"}
            onClick={() => navigate({ to: "/recipes" })}
          >
            Close
          </button>

          <form.Subscribe
            selector={(state) => [state.isDirty, state.isTouched]}
            children={(_) => {
              return (
                <>
                  <button type="submit" form={"editRecipe"} className={"px-2"}>
                    Save
                  </button>

                  <button
                    type="button"
                    className={"px-2"}
                    onClick={() => {
                      form.reset();
                    }}
                  >
                    Reset
                  </button>
                </>
              );
            }}
          />
        </ButtonGroup>
      </form>
    </>
  );
}
