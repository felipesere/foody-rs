import { createFileRoute, useNavigate } from "@tanstack/react-router";
import classnames from "classnames";
import { useRef, useState } from "react";
import { z } from "zod";
import {
  type IngredientWithQuantity,
  type Recipe,
  type Source,
  useAllRecipes,
  useChangeRecipe,
  useDeleteRecipe,
  useRecipeTags,
} from "../../apis/recipes.ts";
import searchIcon from "../../assets/search.png";
import { Button } from "../../components/button.tsx";
import { ButtonGroup } from "../../components/buttonGroup.tsx";
import { Divider } from "../../components/divider.tsx";
import { DottedLine } from "../../components/dottedLine.tsx";
import { FieldSet } from "../../components/fieldset.tsx";
import { MultiSelect } from "../../components/multiselect.tsx";
import { Pill } from "../../components/pill.tsx";
import { AddtoEither } from "../../components/smart/addToEither.tsx";
import { Stars } from "../../components/smart/recipeView.tsx";
import { Tags, TagsTable } from "../../components/tags.tsx";
import {
  filterRecipes,
  RecipeSearchSchemaParams,
  updateSearchParams,
} from "../../domain/search.ts";

const recipeUrlParams = z.object({
  search: RecipeSearchSchemaParams.optional(),
  massEditTags: z.boolean().optional(),
});

export const Route = createFileRoute("/_auth/recipes/")({
  component: RecipesPage,
  validateSearch: recipeUrlParams,
});

export function RecipesPage() {
  const { token } = Route.useRouteContext();
  const { search, massEditTags } = Route.useSearch();
  const { data, isLoading, isError } = useAllRecipes(token);
  const navigate = useNavigate({ from: Route.path });

  const allTags = useRecipeTags(token);
  if (isError) {
    return <p>Error</p>;
  }

  if (isLoading || !(allTags.data && data?.recipes)) {
    return <p>Loading</p>;
  }

  const recipes = filterRecipes(data.recipes, search);
  recipes.sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );

  const knownBookTitles = new Set<string>();
  for (const r of data.recipes) {
    if (r.source === "book") {
      knownBookTitles.add(r.title as string);
    }
  }

  const knownTags = allTags.data.tags;

  return (
    <div className="content-grid space-y-4">
      <FieldSet className={{ fieldSet: "flex-wrap" }}>
        <ButtonGroup>
          <Button
            onClick={() => navigate({ to: "/recipes/new" })}
            label={"New Recipe"}
          />
          <Button
            onClick={() =>
              navigate({
                to: "/recipes",
                search: (params) => ({
                  ...params,
                  massEditTags: massEditTags ? undefined : true,
                }),
              })
            }
            label={"Mass edit tags"}
          />
        </ButtonGroup>
        <FieldSet legend={"Filter"}>
          <MultiSelect
            key={(search?.tags || ["tag"]).toString()} // force to re-render when tags change...
            label={"Select tags"}
            selected={search?.tags || []}
            items={knownTags}
            onItemsSelected={(items) => {
              navigate({
                to: ".",
                search: (params) => {
                  return {
                    search: updateSearchParams(params.search || {}, {
                      tags: { set: items },
                    }),
                  };
                },
              });
            }}
            hotkey={"ctrl+t"}
          />
          <ul className={"flex flex-row gap-2"}>
            {(search?.tags || []).map((tag) => (
              <Pill
                key={"tag"}
                value={tag}
                onClose={() => {
                  navigate({
                    search: (params) => {
                      return {
                        ...params,
                        search: updateSearchParams(params.search || {}, {
                          tags: { remove: tag },
                        }),
                      };
                    },
                  });
                }}
              />
            ))}
          </ul>

          <MultiSelect
            key={(search?.books || ["book"]).toString()} // force to re-render when tags change...
            label={"By book title"}
            selected={search?.books || []}
            items={Array.from(knownBookTitles)}
            onItemsSelected={(items) => {
              navigate({
                to: ".",
                search: (params) => {
                  return {
                    ...params,
                    search: updateSearchParams(params.search || {}, {
                      books: { set: items },
                    }),
                  };
                },
              });
            }}
            hotkey={"ctrl+b"}
          />

          <ul className={"flex flex-row gap-2"}>
            {(search?.books || []).map((book) => (
              <Pill
                key={book}
                value={book}
                onClose={() => {
                  navigate({
                    search: (params) => {
                      return {
                        ...params,
                        search: updateSearchParams(params.search || {}, {
                          books: { remove: book },
                        }),
                      };
                    },
                  });
                }}
              />
            ))}
          </ul>
          <FieldSet legend={"Rating"}>
            <Stars
              rating={search?.rating || 0}
              setRating={(r) => {
                const newRating = r != 0 ? r : undefined;
                navigate({
                  search: (params) => {
                    return {
                      ...params,
                      search: updateSearchParams(params.search || {}, {
                        ratings: { set: newRating },
                      }),
                    };
                  },
                });
              }}
            />
          </FieldSet>
        </FieldSet>
        <FieldSet legend={"Word Search"}>
          <Search
            onSubmit={(term) => {
              navigate({
                search: (params) => {
                  return {
                    ...params,
                    search: updateSearchParams(params.search || {}, {
                      terms: { add: term.toLowerCase() },
                    }),
                  };
                },
              });
            }}
          />
          {(search?.terms || []).map((term) => {
            return (
              <Pill
                key={term}
                value={term}
                onClose={() => {
                  navigate({
                    search: (params) => {
                      return {
                        ...params,
                        search: updateSearchParams(params.search || {}, {
                          terms: { remove: term },
                        }),
                      };
                    },
                  });
                }}
              />
            );
          })}
        </FieldSet>
      </FieldSet>
      {massEditTags ? (
        <MassEditTags token={token} recipes={recipes} />
      ) : (
        <Overview recipes={recipes} />
      )}
    </div>
  );
}

function Overview(props: { recipes: Recipe[] }) {
  return (
    <ul className="grid gap-4">
      {props.recipes.map((recipe) => (
        <RecipeView key={recipe.id} recipe={recipe} />
      ))}
    </ul>
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
  const deleteRecipe = useDeleteRecipe(token);
  const recipeId = props.recipe.id;
  const changeRecipe = useChangeRecipe(token, recipeId);
  const navigate = useNavigate({ from: "/recipes" });

  return (
    <li className="p-2 border-black border-solid border-2">
      <p className="font-black uppercase tracking-wider">{props.recipe.name}</p>
      <ShowSource details={props.recipe} />
      <Stars
        rating={props.recipe.rating}
        setRating={(n) =>
          changeRecipe.mutate({ changes: [{ type: "rating", value: n }] })
        }
      />
      {props.recipe.duration && <p>⏲ {props.recipe.duration}</p>}

      {open ? (
        <div>
          {props.recipe.tags.length > 0 && (
            <>
              <Divider />
              <Tags tags={props.recipe.tags} />
            </>
          )}
          <Divider />
          <p className="uppercase">Ingredients:</p>
          <ul>
            {props.recipe.ingredients.map((ingredient) => (
              <IngredientView
                key={ingredient.ingredient.name}
                ingredient={ingredient}
              />
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
            navigate({
              to: "/recipes/$recipeId",
              params: { recipeId: props.recipe.id.toString() },
            });
          }}
        >
          View
        </button>
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
        <AddtoEither recipeId={recipeId} token={token} />
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

function IngredientView({
  ingredient: { ingredient, quantity },
}: {
  ingredient: IngredientWithQuantity;
}) {
  return (
    <li className="flex flex-row justify-between">
      <p className="font-light text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {ingredient.name}
      </p>
      <DottedLine />
      <p className="text-light" style={{ flex: "none" }}>
        {quantity[0].value} {quantity[0].unit}
      </p>
    </li>
  );
}

function ShowSource(props: { details: Source }) {
  switch (props.details.source) {
    case "website":
      return (
        <a target="_blank" href={props.details.url || ""} rel="noreferrer">
          {maybeHostname(props.details.url || "")}
        </a>
      );
    case "book":
      return (
        <div className="flex flex-row">
          <p className="mr-4">{props.details.title}</p>
          <p>{`p.${props.details.page}`}</p>
        </div>
      );
  }
}

function maybeHostname(v: string): string {
  try {
    return new URL(v).hostname;
  } catch (err) {
    return v;
  }
}

function MassEditTags(props: { token: string; recipes: Recipe[] }) {
  let recipes = props.recipes;
  const [newTags, setNewTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const changeRecipe = useChangeRecipe(props.token);

  let tags = recipes
    .flatMap((i) => i.tags)
    .sort()
    .filter((x, i, a) => a.indexOf(x) == i);

  let combinedTags = new Set([...tags, ...newTags]);
  let knownTags = Array.from(combinedTags.values()).sort()

  return (
    <div>
      <input
        placeholder={"Additional Tag"}
        className={"px-2 border-2"}
        type={"text"}
        ref={inputRef}
      />
      <button
        className={"px-2 ml-2"}
        type={"button"}
        onClick={() => {
          let newTag = inputRef.current?.value;
          if (newTag) {
            setNewTags((prevTags) => [...prevTags, newTag]);
          }
        }}
      >
        Add
      </button>
      <TagsTable
        batchEdit={true}
        items={recipes}
        knownTags={Array.from(knownTags.values())}
        toggleTags={(id, tags) =>
          changeRecipe.mutate({
            changes: [{ type: "tags", value: tags }],
            recipeId: id,
          })
        }
      />
    </div>
  );
}
