import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import {
  type Book,
  type Ingredient,
  type Recipe,
  type Website,
  addRecipeToShoppinglist,
  useAllRecipes,
} from "../apis/recipes.ts";
import { useAllShoppinglists } from "../apis/shoppinglists.ts";
import type { Shoppinglist } from "../apis/shoppinglists.ts";
import { DottedLine } from "../misc/dottedLine.tsx";

export const Route = createFileRoute("/_auth/recipes")({
  component: RecipesPage,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();

  const { data: recipes } = useAllRecipes(token);

  return (
    <div className="content-grid">
      <ul className="grid gap-4">
        {recipes ? (
          recipes.recipes.map((recipe) => (
            <RecipeView key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p>Loading</p>
        )}
      </ul>
    </div>
  );
}

type RecipeProps = {
  recipe: Recipe;
};

function RecipeView(props: RecipeProps) {
  const { token } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const addRecipe = addRecipeToShoppinglist(token);
  const recipeId = props.recipe.id;

  return (
    <li className="p-2 border-black border-solid border-2">
      <p className="font-black uppercase tracking-wider">{props.recipe.name}</p>
      <div>
        {props.recipe.source === "book" ? (
          <BookSource title={props.recipe.title} page={props.recipe.page} />
        ) : (
          <WebsiteSource url={props.recipe.url} />
        )}
      </div>
      {open ? (
        <div>
          <hr className={"w-full border-t border-solid border-black"} />
          <p className="uppercase">Ingredients:</p>
          <ul>
            {props.recipe.ingredients.map((ingredient) => (
              <IngredientView key={ingredient.name} ingredient={ingredient} />
            ))}
          </ul>
        </div>
      ) : null}
      <div className="space-x-4">
        <button
          className={classnames("px-2", {
            "double-border": open,
            shadow: !open,
          })}
          type={"submit"}
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          Details
        </button>
        <AddToShoppinglist
          token={token}
          onSelect={(shoppinglistId) =>
            addRecipe.mutate({ shoppinglistId, recipeId })
          }
        />
        <button type="submit" className="px-2 text-white bg-gray-700 shadow">
          Delete
        </button>
      </div>
    </li>
  );
}

type Props = {
  token: string;
  onSelect: (id: Shoppinglist["id"]) => void;
};

function AddToShoppinglist(props: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(3), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="submit"
        className="px-2 text-black bg-gray-300 shadow"
      >
        Add
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={"bg-gray-200 p-2 border-solid border-black border-2"}
          >
            <PickShoppinglist
              token={props.token}
              onSelect={(id) => {
                props.onSelect(id);
                setIsOpen(false);
              }}
            />
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}

function PickShoppinglist(props: Props) {
  const { isLoading, data } = useAllShoppinglists(props.token);

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  return (
    <ol className={"space-y-2"}>
      {data.shoppinglists.map((list) => (
        <li key={list.id}>
          <button
            type={"submit"}
            onClick={(e) => {
              e?.preventDefault();
              props.onSelect(list.id);
            }}
            className={"px-2 bg-white shadow"}
          >
            {list.name}
          </button>
        </li>
      ))}
    </ol>
  );
}

function IngredientView({ ingredient }: { ingredient: Ingredient }) {
  return (
    <li className="flex flex-row justify-between">
      <p className="font-light text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {ingredient.name}
      </p>
      <DottedLine />
      <p className="text-light" style={{ flex: "none" }}>
        {ingredient.quantity[0].value} {ingredient.quantity[0].unit}
      </p>
    </li>
  );
}

type BookSourceProps = Pick<Book, "title" | "page">;
function BookSource(props: BookSourceProps) {
  return (
    <div className="flex flex-row">
      <p className="mr-4">{props.title}</p>
      <p>{`p.${props.page}`}</p>
    </div>
  );
}

type WebsiteSourceProps = Pick<Website, "url">;
function WebsiteSource(props: WebsiteSourceProps) {
  return (
    <a target="_blank" href={props.url} rel="noreferrer">
      {new URL(props.url).hostname}
    </a>
  );
}
