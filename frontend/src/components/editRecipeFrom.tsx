import { useForm } from "@tanstack/react-form";
import type { Recipe } from "../apis/recipes.ts";
import { humanize } from "../quantities.ts";
import { ButtonGroup } from "./buttonGroup.tsx";
import { DeleteRowButton } from "./deleteRowButton.tsx";
import { Divider } from "./divider.tsx";
import { DottedLine } from "./dottedLine.tsx";
import { FieldSet } from "./fieldset.tsx";
import { FindIngredient } from "./findIngredient.tsx";
import { ResizingInput } from "./resizeableInput.tsx";
import { MultiSelect } from "./multiselect.tsx";
import { useAllTags } from "../apis/tags.ts";

export type SimplifiedRecipe = Omit<Recipe, "id" | "ingredients"> & {
  ingredients: { id: number; name: string; quantity: string }[];
};

export function EditRecipeFrom(props: {
  token: string;
  recipe: Recipe;
  onSubmit: (s: SimplifiedRecipe) => void;
  onClose: () => void;
}) {
  const token = props.token;
  const recipe = props.recipe;

  const tags = useAllTags(token);

  const form = useForm({
    defaultValues: {
      name: recipe.name,
      source: recipe.source,
      title: recipe.source === "book" ? recipe.title : null,
      page: recipe.source === "book" ? recipe.page : null,
      url: recipe.source === "website" ? recipe.url : null,
      ingredients: recipe.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        // TODO: I think I need fox `quantity[0]` at some point
        quantity: humanize(i.quantity[0]),
      })),
      tags: recipe.tags,
    },
    onSubmit: async (vals) => {
      switch (vals.value.source) {
        case "website":
          vals.value.page = null;
          vals.value.title = null;
          break;
        case "book":
          vals.value.url = null;
          break;
      }
      const s: SimplifiedRecipe = vals.value;
      props.onSubmit(s);
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
        <FieldSet legend={"Tags"}>
          <form.Field
            name={"tags"}
            mode={"array"}
            children={(field) => {
              return (
                <>
                  <ol className={"flex flex-row gap-2"}>
                    {field.state.value.map((tag) => (
                      <p key={tag}>#{tag}</p>
                    ))}
                  </ol>
                  <MultiSelect
                    label={"Select Tags"}
                    items={Object.keys(tags.data || [])}
                    onNewItem={(item) => {
                      field.pushValue(item);
                    }}
                    onItemsSelected={(items) => {
                      const total = field.state.value.length;
                      for (let i = 0; i < total; i++) {
                        field.removeValue(i);
                      }
                      for (const item in items) {
                        field.pushValue(item);
                      }
                    }}
                  />
                </>
              );
            }}
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
                        <p data-testid={"ingredient"}>{ingredient.name}</p>
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
            onClick={() => props.onClose()}
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
