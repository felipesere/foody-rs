import { useQueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import classnames from "classnames";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  type Book,
  type Ingredient,
  type Instructions,
  type Recipe,
  type Website,
  addRecipeToShoppinglist,
  useAllRecipes,
  useDeleteRecipe,
  useRecipeOptions,
} from "../apis/recipes.ts";
import { useAllTags } from "../apis/tags.ts";
import searchIcon from "../assets/search.png";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { FieldSet } from "../components/fieldset.tsx";
import { MultiSelect } from "../components/multiselect.tsx";
import { Pill } from "../components/pill.tsx";
import { AddToShoppinglist } from "../components/smart/addToShoppinglist.tsx";

const RecipeSearchSchema = z.object({
  tags: z.array(z.string()).optional(),
  term: z.string().optional(),
});
type RecipeSearch = z.infer<typeof RecipeSearchSchema>;

function updateSearch(
  previous: RecipeSearch,
  changes: {
    tags?: { set?: string[]; add?: string; remove?: string };
    term?: { set?: string };
  },
): RecipeSearch {
  if (changes.tags?.set) {
    previous.tags = changes.tags.set;
  }

  if (changes.tags?.add) {
    previous.tags = [...(previous.tags || []), changes.tags.add];
  }

  if (changes.tags?.remove) {
    previous.tags = (previous.tags || []).filter(
      (t) => t !== changes.tags?.remove,
    );
    if (previous.tags.length === 0) {
      previous.tags = undefined;
    }
  }

  if (changes.term) {
    previous.term = changes.term.set;
  }

  return previous;
}
export const Route = createFileRoute("/_auth/recipes")({
  component: RecipesPage,
  validateSearch: RecipeSearchSchema,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();
  const { tags, term } = Route.useSearch();
  const { data, isLoading, isError } = useAllRecipes(token);
  const navigate = useNavigate({ from: Route.path });

  const allTags = useAllTags(token);

  if (isError) {
    return <p>Error</p>;
  }

  if (isLoading || !(allTags.data && data?.recipes)) {
    return <p>Loading</p>;
  }

  const recipes = data.recipes.filter(
    (recipe) =>
      (tags || []).every((t) => recipe.tags.includes(t)) &&
      (recipe.name.includes(term || "") ||
        recipe.ingredients.some((ingredient) =>
          ingredient.name.includes(term || ""),
        )),
  );

  recipes.sort((a, b) => a.name.localeCompare(b.name));

  const knownTags = Object.keys(allTags.data);

  return (
    <>
      <Outlet />
      <div className="content-grid space-y-4">
        <FieldSet legend={"..."} className={{ fieldSet: "flex flex-col" }}>
          <ButtonGroup>
            <Button
              onClick={() => navigate({ to: "/recipes/new" })}
              label={"New Recipe"}
            />
          </ButtonGroup>
          <FieldSet legend={"Filter"}>
            <MultiSelect
              key={(tags || []).toString()} // force to re-render when tags change...
              label={"Select tags"}
              selected={tags || []}
              items={knownTags}
              onItemsSelected={(items) => {
                navigate({
                  search: (params) =>
                    updateSearch(params, { tags: { set: items } }),
                });
              }}
              hotkey={"ctrl+t"}
            />
            <ul className={"flex flex-row gap-2"}>
              {(tags || []).map((tag) => (
                <Pill
                  key={"tag"}
                  value={tag}
                  onClose={() => {
                    navigate({
                      search: (params) =>
                        updateSearch(params, { tags: { remove: tag } }),
                    });
                  }}
                />
              ))}
            </ul>
          </FieldSet>
          <FieldSet legend={"Word Search"}>
            <Search
              onSubmit={(term) => {
                navigate({
                  search: (params) =>
                    updateSearch(params, {
                      term: { set: term.toLowerCase() },
                    }),
                });
              }}
            />
            {term && (
              <Pill
                value={term}
                onClose={() => {
                  navigate({
                    search: (params) =>
                      updateSearch(params, { term: { set: undefined } }),
                  });
                }}
              />
            )}
          </FieldSet>
        </FieldSet>
        <ul className="grid gap-4">
          {recipes.map((recipe) => (
            <RecipeView key={recipe.id} recipe={recipe} />
          ))}
        </ul>
      </div>
    </>
  );
}

type SearchProps = {
  onSubmit: (term: string) => void;
};

function Search(props: SearchProps) {
  const [term, setTerm] = useState("");
  return (
    <div className={"flex flex-row"}>
      <input
        type="text"
        className={"pl-2 bg-gray-200"}
        placeholder={"anything..."}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            props.onSubmit(term);
          }
        }}
      />
      <button
        type={"button"}
        className={"borderless hover:bg-gray-300 p-2"}
        onClick={() => props.onSubmit(term)}
      >
        <img
          className={"size-4"}
          alt={"Magnifying glass symbolising a search"}
          src={searchIcon}
        />
      </button>
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
  const deleteRecipe = useDeleteRecipe(token);
  const recipeId = props.recipe.id;
  const navigate = useNavigate({ from: "/recipes" });
  const client = useQueryClient();

  let sourceComponent: JSX.Element;
  let methodToggle = false;
  switch (props.recipe.source) {
    case "book":
      sourceComponent = <BookSource title={props.recipe.title} page={props.recipe.page} />;
      break;
    case "website":
      sourceComponent = <WebsiteSource url={props.recipe.url} />;
      break;
    case "instructions":
      methodToggle = true;
      sourceComponent = (
        <div>
          <p className="uppercase">Method: </p>
          <div>
            <InstructionsSource instructions={props.recipe.instructions} />
          </div>
        </div>
        );
      break;
    default:
      sourceComponent = (<div></div>)
      break;
}

  return (
    <li className="p-2 border-black border-solid border-2">
      <p className="font-black uppercase tracking-wider">{props.recipe.name}</p>
      <div>{methodToggle ? '' : sourceComponent}</div>
      {open ? (
        <div>
          {props.recipe.tags.length > 0 && (
            <>
              <Divider />
              <ol className={"flex flex-row gap-2"}>
                {props.recipe.tags.map((tag) => (
                  <p key={tag}>#{tag}</p>
                ))}
              </ol>
            </>
          )}
          <Divider />

          {methodToggle ? sourceComponent : ""}

          <p className="uppercase">Ingredients:</p>
          <ul>
            {props.recipe.ingredients.map((ingredient) => (
              <IngredientView key={ingredient.name} ingredient={ingredient} />
            ))}
          </ul>
        </div>
      ) : null}
      <Divider />
      {props.recipe.tags.length > 0 && (
        <>
          {props.recipe.tags.map((tag) => (
            <p className={"inline-block mr-2"} key={tag}>
              #{tag}
            </p>
          ))}
          <Divider />
        </>
      )}
      <ButtonGroup>
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
        <button
          className={classnames("px-2", {
            "double-border": open,
            shadow: !open,
          })}
          type={"submit"}
          onMouseEnter={(_) => {
            client.prefetchQuery(useRecipeOptions(token, recipeId));
          }}
          onClick={() =>
            navigate({
              to: "/recipes/$recipeId/edit",
              params: { recipeId: props.recipe.id.toString() },
            })
          }
        >
          Edit
        </button>
        <AddToShoppinglist
          token={token}
          onSelect={(shoppinglist) => {
            addRecipe.mutate({ shoppinglistId: shoppinglist.id, recipeId });
            toast(
              `Added "${props.recipe.name}" to shoppinglist "${shoppinglist.name}"`,
            );
          }}
        />
        <button
          type="submit"
          className="px-2 text-white bg-gray-700 shadow"
          onClick={() => deleteRecipe.mutate(recipeId)}
        >
          Delete
        </button>
      </ButtonGroup>
    </li>
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

export type BookSourceProps = Pick<Book, "title" | "page">;
export function BookSource(props: BookSourceProps) {
  return (
    <div className="flex flex-row">
      <p className="mr-4">{props.title}</p>
      <p>{`p.${props.page}`}</p>
    </div>
  );
}

export type WebsiteSourceProps = Pick<Website, "url">;
export function WebsiteSource(props: WebsiteSourceProps) {
  return (
    <a target="_blank" href={props.url} rel="noreferrer">
      {maybeHostname(props.url)}
    </a>
  );
}

export type InstructionsSourceProps = Pick<Instructions, "instructions">;
export function InstructionsSource(props: InstructionsSourceProps) {
  return (
    <div className="flex flex-row">
      <p className="mr-4 font-light text-gray-700">{props.instructions}</p>
    </div>
  );
}

function maybeHostname(v: string): string {
  try {
    return new URL(v).hostname;
  } catch (err) {
    return v;
  }
}
