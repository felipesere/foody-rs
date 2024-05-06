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
import { useRecipe } from "../apis/recipes.ts";

import { useState } from "react";
import { ButtonGroup } from "../components/ButtonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { Editable } from "../components/editable.tsx";
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
      <form>
        <fieldset className={"border-black border-2 p-2"}>
          <legend className={"px-2"}>Website</legend>
          <div className={"flex flex-row gap-2"}>
            <label>URL</label>
            <Editable
              isEditing={true}
              className={"w-full"}
              value={props.website?.url || ""}
              onBlur={(url) => console.log(url)}
            />
          </div>
        </fieldset>
      </form>
    );
  }

  type Book = {
    page: number;
    title: string;
  };

  function EditBook(props: { book: Book | null }) {
    return (
      <form>
        <fieldset className={"border-black border-2 p-2"}>
          <legend className={"px-2"}>Book</legend>

          <div className={"flex flex-row gap-2"}>
            <label>Title</label>
            <Editable
              isEditing={true}
              value={props.book?.title || ""}
              onBlur={(title) => console.log(title)}
            />
          </div>

          <div className={"flex flex-row gap-2"}>
            <label>Page</label>
            <Editable
              isEditing={true}
              value={props.book?.page.toString() || ""}
              onBlur={(page) => console.log(page)}
            />
          </div>
        </fieldset>
      </form>
    );
  }

  return (
    <FloatingOverlay
      lockScroll
      className={
        "the-overlay-backdrop bg-black/25 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
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
          <form>
            <fieldset
              className={"border-black border-2 p-2 flex flex-row gap-4"}
            >
              <legend className={"px-2"}>Name</legend>
              <Editable
                isEditing={true}
                value={recipe.name}
                onBlur={(name) => console.log(`new name: ${name}`)}
              />
            </fieldset>
          </form>

          {/* Figure out how to make it all a form that is possibly editable?! */}
          <form>
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
          </form>

          {sourceKind === "book" ? (
            <EditBook book={maybeBook} />
          ) : (
            <EditWebsite website={maybeWebsite} />
          )}

          <div>
            <label>Ingredients</label>
            <ol>
              {recipe.ingredients.map((ingredient) => {
                return (
                  <li
                    key={ingredient.id}
                    className={"flex flex-row justify-between"}
                  >
                    <p>{ingredient.name}</p>
                    <DottedLine className={"flex-shrink"} />
                    <Editable
                      isEditing={true}
                      value={humanize(ingredient.quantity[0])}
                      onBlur={(v) => console.log(v)}
                    />
                  </li>
                );
              })}
            </ol>

            <FindIngredient
              token={token}
              onIngredient={(_ingredient, _quantity) => {
                // here is where we can add an ingredient and quantity to a recipe!
              }}
            />
          </div>
          <Divider />
          <ButtonGroup>
            <button
              type="button"
              className={"px-2"}
              onClick={() => navigate({ to: "/recipes" })}
            >
              Close
            </button>

            <button
              type="button"
              className={"px-2"}
              onClick={() => navigate({ to: "/recipes" })}
            >
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
