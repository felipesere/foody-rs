import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { type Ingredient, type Source, useRecipe } from "../apis/recipes.ts";
import { Button } from "../components/button.tsx";
import { ButtonGroup } from "../components/buttonGroup.tsx";
import { DeleteButton } from "../components/deleteButton.tsx";
import { Divider } from "../components/divider.tsx";
import { DottedLine } from "../components/dottedLine.tsx";
import { MultiSelect } from "../components/multiselect.tsx";
import { SelectIngredientWithQuantity } from "../components/smart/selectIngredientWithQuantity.tsx";

const RecipeSearch = z.object({
  editing: z.boolean().optional(),
});

export const Route = createFileRoute("/_auth/recipes/$recipeId")({
  component: RecipePage,
  validateSearch: RecipeSearch,
});

function RecipePage() {
  const { editing } = Route.useSearch();
  const { recipeId } = Route.useParams();
  const { token } = Route.useRouteContext();
  const data = useRecipe(token, Number(recipeId));
  const [rating, setRating] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const navigate = useNavigate({ from: Route.fullPath });

  // TODO: needs to be lower inside of layout... but we will get there
  if (data.isLoading) {
    return <p>Loading</p>;
  }

  if (!data.data) {
    return <p>Error</p>;
  }

  const recipe = data.data;

  return (
    <div className="content-grid space-y-4 pb-20">
      <div className={"grid gap-4 grid-cols-1 sm:grid-cols-2"}>
        {/* left or top */}
        <div>
          <h1 className={"capitalize underline underline-offset-2"}>
            {recipe.name}
          </h1>
          <ShowSource details={recipe} editing={editing || false} />
          <Stars rating={rating} setRating={setRating} />
          <Tags tags={tags} editing={editing || false} onSetTags={setTags} />
          <Divider />
          <Ingredients
            token={token}
            editing={editing || false}
            ingredients={recipe.ingredients}
          />
        </div>
        <div>
          <h2>Notes:</h2>
          <textarea className={"w-full h-full"} placeholder={"Any notes?"} />
        </div>
      </div>
      <Divider />
      <ButtonGroup>
        <Button
          label={editing ? "Save" : "Edit"}
          onClick={() => navigate({ search: { editing: !editing } })}
        />
        <Button label={"Add to Shoppinglist"} />
        <Button label={"Add to Meal plan"} />
      </ButtonGroup>
    </div>
  );
}

function Ingredients(props: {
  ingredients: Ingredient[];
  editing: boolean;
  token: string;
}) {
  return (
    <div className={"flex flex-col gap-2"}>
      <p className="uppercase">Ingredients:</p>
      <ul>
        {props.ingredients.map((ingredient) => (
          <IngredientView
            key={ingredient.name}
            editing={props.editing}
            ingredient={ingredient}
          />
        ))}
      </ul>
      {props.editing && (
        <SelectIngredientWithQuantity
          token={props.token}
          onIngredient={() => {}}
        />
      )}
    </div>
  );
}

function Tags(props: {
  tags: string[];
  editing: boolean;
  onSetTags: (items: string[]) => void;
}) {
  return (
    <ol className={"flex flex-row gap-2"}>
      {props.tags.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
      {props.editing && (
        <MultiSelect
          label={"Select Tags"}
          items={["these", "are", "placeholder", "tags"]}
          selected={["these"]}
          onItemsSelected={props.onSetTags}
        />
      )}
    </ol>
  );
}

function Stars(props: { rating: number; setRating: (n: number) => void }) {
  function Star(props: { rating: number; idx: number; onClick: () => void }) {
    const css = props.idx <= props.rating ? "text-amber-500" : "text-gray-300";
    return (
      <span className={css} onClick={props.onClick}>
        *
      </span>
    );
  }

  return (
    <div>
      {[1, 2, 3, 4, 5].map((idx) => (
        <Star
          key={idx}
          rating={props.rating}
          idx={idx}
          onClick={() => props.setRating(idx)}
        />
      ))}
    </div>
  );
}

function IngredientView(props: { ingredient: Ingredient; editing: boolean }) {
  const quantity = `${props.ingredient.quantity[0].value} ${props.ingredient.quantity[0].unit}`;
  return (
    <li className="flex flex-row justify-between">
      {props.editing && (
        <DeleteButton className={"text-red-700 mr-2"} onClick={() => {}} />
      )}
      <p className="font-light text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {props.ingredient.name}
      </p>
      <DottedLine />
      {props.editing ? (
        <Input type={"text"} value={quantity} />
      ) : (
        <p className="text-light" style={{ flex: "none" }}>
          {quantity}
        </p>
      )}
    </li>
  );
}

// TODO: move this back into the normal show recipes
function ShowSource(props: { details: Source; editing: boolean }) {
  switch (props.details.source) {
    case "website":
      if (props.editing) {
        return (
          // TODO: Consider if I really want the resizable one...
          <Input type={"text"} value={props.details.url} />
        );
      }
      return (
        <a target="_blank" href={props.details.url} rel="noreferrer">
          {maybeHostname(props.details.url)}
        </a>
      );
    case "book":
      if (props.editing) {
        return (
          <div className={"flex gap-2 flex-row"}>
            <Input type={"text"} value={props.details.title} />
            <span>
              p.
              <Input type={"number"} value={props.details.page} />
            </span>
          </div>
        );
      }
      return (
        <div className="flex gap-2 flex-row">
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

function Input(
  props: { type: "text"; value: string } | { type: "number"; value: number },
) {
  return (
    <input
      autoComplete={"off"}
      type={props.type}
      value={props.value}
      className={
        "border-none bg-transparent outline-2 -outline-offset-2 outline-dashed outline-amber-400 focus:outline"
      }
    />
  );
}
