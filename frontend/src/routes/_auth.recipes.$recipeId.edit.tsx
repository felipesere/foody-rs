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
import { type Quantity, useRecipe } from "../apis/recipes.ts";
import type { Ingredient } from "../apis/ingredients.ts";

import classnames from "classnames";
import { type InputHTMLAttributes, useState } from "react";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { FindIngredient } from "../components/findIngredient.tsx";
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
  const [sourceKind, setSourceKind] = useState<"book" | "website">("book");

  const [additionalIngredients, setAdditionalIngredients] = useState<
    Array<{ ingredient: Ingredient; quantity: Quantity }>
  >([]);

  if (!data.data) {
    return undefined;
  }

  const recipe = data.data;

  const maybeBook =
    recipe.source === "book"
      ? { page: recipe.page, title: recipe.title }
      : null;
  const maybeWebsite = recipe.source === "website" ? { url: recipe.url } : null;

  type Website = {
    url: string;
  };
  function EditWebsite(props: { website: Website | null }) {
    return (
      <fieldset className={"border-black border-2 p-2"}>
        <legend className={"px-2"}>Website</legend>
        <div className={"flex flex-row gap-2"}>
          <label>URL</label>
          <FancyInput3 value={props.website?.url || ""} />
        </div>
      </fieldset>
    );
  }

  type Book = {
    page: number;
    title: string;
  };

  function EditBook(props: { book: Book | null }) {
    return (
      <fieldset className={"border-black border-2 p-2"}>
        <legend className={"px-2"}>Book</legend>

        <div className={"flex flex-row gap-2"}>
          <label>Title</label>
          <FancyInput3 name={"bookTitle"} value={props.book?.title || ""} />
        </div>

        <div className={"flex flex-row gap-2"}>
          <label>Page</label>
          <FancyInput3
            name={"bookPage"}
            value={props.book?.page.toString() || ""}
          />
        </div>
      </fieldset>
    );
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
          <p className={"font-bold"}>Edit recipe</p>
          <form
            id="editRecipe"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const _newRecipeForm = new FormData(e.currentTarget);
            }}
          >
            <fieldset
              className={"border-black border-2 p-2 flex flex-row gap-4"}
            >
              <legend className={"px-2"}>Name</legend>
              <FancyInput3 name={"name"} value={recipe.name} />
            </fieldset>

            <fieldset
              className={"border-black border-2 p-2 flex flex-row gap-4"}
            >
              <legend className={"px-2"}>Kind of source</legend>
              <div className="flex flex-row gap-1">
                <input
                  type="radio"
                  id="book"
                  name="source"
                  value="book"
                  checked={sourceKind === "book"}
                  onChange={() => setSourceKind("book")}
                />
                <label htmlFor="book">Book</label>
              </div>

              <div className="flex flex-row gap-1">
                <input
                  type="radio"
                  id="website"
                  name="source"
                  value="website"
                  checked={sourceKind === "website"}
                  onChange={() => setSourceKind("website")}
                />
                <label htmlFor="website">Website</label>
              </div>
            </fieldset>

            {sourceKind === "book" ? (
              <EditBook book={maybeBook} />
            ) : (
              <EditWebsite website={maybeWebsite} />
            )}

            <fieldset className={"border-black border-2 p-2"}>
              <legend className={"px-2"}>Ingredients</legend>
              <ol>
                {recipe.ingredients.map((ingredient, ) => {
                  return (
                    <li
                      key={ingredient.id}
                      className={"flex flex-row justify-between"}
                    >
                      <p>{ingredient.name}</p>
                      <DottedLine className={"flex-shrink"} />
                      <FancyInput3
                        name={`ingredient[${ingredient.name}]`}
                        value={humanize(ingredient.quantity[0])}
                      />
                    </li>
                  );
                })}
                {additionalIngredients.map(({ ingredient, quantity }) => {
                  return (
                    <li
                      key={ingredient.id}
                      className={"flex flex-row justify-between"}
                    >
                      <p>{ingredient.name}</p>
                      <DottedLine className={"flex-shrink"} />
                      <FancyInput3
                        name={`quantity[${ingredient.name}]`}
                        value={humanize(quantity)}
                      />
                    </li>
                  );
                })}
              </ol>

              <FindIngredient
                className={"mt-2"}
                token={token}
                onIngredient={(ingredient, quantity) => {
                  setAdditionalIngredients((before) => [
                    ...before,
                    { ingredient, quantity },
                  ]);
                  // here is where we can add an ingredient and quantity to a recipe!
                }}
              />
            </fieldset>
          </form>
          <Divider />
          <ButtonGroup>
            <button
              type="button"
              className={"px-2"}
              onClick={() => navigate({ to: "/recipes" })}
            >
              Close
            </button>

            <button type="submit" form={"editRecipe"} className={"px-2"}>
              Save
            </button>

            <button
              type="button"
              className={"px-2"}
              onClick={() => navigate({ to: "/recipes" })}
            >
              Cancel
            </button>
          </ButtonGroup>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
}

// function FancyInput(props: { value: string }) {
//   return (
//     <input
//       className={"flex-shrink w-fit"}
//       type={"text"}
//       defaultValue={props.value}
//     />
//   );
// }

/*
function FancyInput2(props: { value: string }) {
  const len = props.value.length;
  return (
    <input
      className={"flex-shrink"}
      style={{ width: `${len}ch` }}
      type={"text"}
      defaultValue={props.value}
    />
  );
}
 */

interface InputAutosizeProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

export default function FancyInput3({
  className,
  value,
  ...props
}: InputAutosizeProps) {
  const [x, setX] = useState(value);
  return (
    <div className={classnames("grid", className)}>
      <span className="invisible" style={{ gridArea: " 1 / 1 " }}>
        {!x && "\u00A0"}
        {x.replace(/ /g, "\u00A0")}
      </span>
      <input
        size={1}
        style={{ gridArea: " 1 / 1 " }}
        type="text"
        value={x}
        className={"border-none bg-transparent focus:outline-none"}
        {...props}
        onChange={(e) => setX(e.target.value)}
      />
    </div>
  );
}
