import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRecipe } from "../apis/recipes.ts";
import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import { Editable } from "../components/editable.tsx";
import { useState } from "react";
import { humanize } from "../quantities.ts";
import { DottedLine } from "../components/dottedLine.tsx";
import {FindIngredient} from "../components/findIngredient.tsx";

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
      <div className={"flex flex-row gap-2"}>
        <label htmlFor={"editWebsite"}>Website</label>
        <input
          type="text"
          id={"editWebsite"}
          className={"w-full"}
          value={props.website?.url || ""}
        />
      </div>
    );
  }

  type Book = {
    page: number;
    title: string;
  };

  function EditBook(props: { book: Book | null }) {
    return (
      <>
        <div className={"flex flex-row gap-2"}>
          <p>Book title</p>
          <Editable
            isEditing={true}
            value={props.book?.title || ""}
            onBlur={(title) => console.log(title)}
          />
        </div>

        <div className={"flex flex-row gap-2"}>
          <label htmlFor={"editBookPage"}>Book page</label>
          <input
            type="text"
            id={"editBookPage"}
            value={props.book?.page || ""}
          />
        </div>
      </>
    );
  }

  return (
    // <FloatingOverlay lockScroll className={"bg-black/30 fixed top-0 left-0 right-0 bottom-0"}>
    <FloatingOverlay
      lockScroll
      className={
        "bg-black/25 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
      }
    >
      <FloatingFocusManager context={context}>
        <div
            ref={refs.setFloating}
            {...getFloatingProps({
              className:
                  "m-2 p-4 bg-white w-full max-w-2xl relative border-solid border-black border-2 space-y-4",
            })}
        >
          <div className={"flex flex-row gap-4"}>
            <p>Name:</p>
            <Editable
                isEditing={true}
                value={recipe.name}
                onBlur={(name) => console.log(`new name: ${name}`)}
            />
          </div>

          <div className={"flex flex-row gap-4"}>
            <p>Kind of source:</p>
            <div>
              <input
                  type="radio"
                  id="book"
                  name="source"
                  value="book"
                  checked={sourceKind === "book"}
                  onChange={() => setSourceKind("book")}
              />
              <label className="ml-2" htmlFor="huey">
                Book
              </label>
            </div>

            <div>
              <input
                  type="radio"
                  id="website"
                  name="source"
                  value="website"
                  checked={sourceKind === "website"}
                  onChange={() => setSourceKind("website")}
              />
              <label className={"ml-2"} htmlFor="website">
                Website
              </label>
            </div>
          </div>

          {sourceKind === "book" ? (
              <EditBook book={maybeBook}/>
          ) : (
              <EditWebsite website={maybeWebsite}/>
          )}

          <ol>
            {recipe.ingredients.map((ingredient) => {
              return (
                  <li
                      key={ingredient.id}
                      className={"flex flex-row justify-between"}
                  >
                    <p>{ingredient.name}</p>
                    <DottedLine className={"flex-shrink"}/>
                    <Editable
                        isEditing={true}
                        value={humanize(ingredient.quantity[0])}
                        onBlur={(v) => console.log(v)}
                    />
                  </li>
              );
            })}
          </ol>
          <hr className="h-0.5 my-2 bg-black border-0"/>
          <FindIngredient token={token} shoppinglistId={-1}/>
          <hr className="h-0.5 my-2 bg-black border-0"/>
          <div className={"flex flex-row gap-4"}>
            <button
                type="button"
                className={"px-2"}
                onClick={() => navigate({to: "/recipes"})}
            >
              Close
            </button>

            <button
                type="button"
                className={"px-2"}
                onClick={() => navigate({to: "/recipes"})}
            >
              Save
            </button>

            <button
                type="button"
                className={"px-2"}
                onClick={() => navigate({to: "/recipes"})}
            >
              Cancel
            </button>
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
}
