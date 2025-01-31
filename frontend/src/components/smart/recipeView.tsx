import classNames from "classnames";
import { createContext, useContext, useState } from "react";
import type {
  Ingredient,
  Ingredient as OnlyIngredient,
} from "../../apis/ingredients.ts";
import type { MealPlan } from "../../apis/mealplans.ts";
import {
  type Source,
  type UnstoredIngredient,
  type UnstoredRecipe,
  useAllRecipes,
  useRecipeTags,
} from "../../apis/recipes.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { humanize } from "../../quantities.ts";
import { Labeled } from "../Labeled.tsx";
import { Button } from "../button.tsx";
import { ButtonGroup } from "../buttonGroup.tsx";
import { DeleteButton } from "../deleteButton.tsx";
import { Divider } from "../divider.tsx";
import { DottedLine } from "../dottedLine.tsx";
import { Dropdown } from "../dropdown.tsx";
import { MultiSelect } from "../multiselect.tsx";
import { AddToMealPlan } from "./addToMealplan.tsx";
import { AddToShoppinglist } from "./addToShoppinglist.tsx";
import { SelectIngredientWithQuantity } from "./selectIngredientWithQuantity.tsx";

export const RecipeContext = createContext({
  editing: false,
  token: "",
});

type RecipeViewProps = {
  recipe: UnstoredRecipe;
  onSave: (isEditing: boolean) => void;
  onCancel: () => void;
  onSetName: (name: string) => void;
  onSetSource: (source: Source) => void;
  onSetRating: (rating: number) => void;
  onSetTags: (tags: string[]) => void;
  // TODO: string here sucks...
  onAddedIngredient: (ingredient: OnlyIngredient, quantity: string) => void;
  onRemoveIngredient: (name: Ingredient["name"]) => void;
  onChangeQuantity: (name: Ingredient["name"], quantity: string) => void;
  onSetNote: (notes: string) => void;
  onSetDuration: (duration: string) => void;
  onAddToShoppinglist?: (shoppinglistId: Shoppinglist["id"]) => void;
  onAddToMealPlan?: (mealplanId: MealPlan["id"]) => void;
};
export function RecipeView(props: RecipeViewProps) {
  const { editing, token } = useContext(RecipeContext);

  const recipe = props.recipe;

  return (
    <div className="content-grid space-y-4 pb-20">
      <div className={"grid gap-4 grid-cols-1 sm:grid-cols-2"}>
        {/* left or top */}
        <div className={"flex flex-col gap-2"}>
          <Name value={recipe.name} onBlur={props.onSetName} />
          <ShowSource
            token={token}
            recipe={recipe}
            onBlur={props.onSetSource}
          />
          <div className={"flex flex-row gap-2"}>
            <p>Rating:</p>{" "}
            <Stars rating={recipe.rating} setRating={props.onSetRating} />
          </div>
          <Tags tags={recipe.tags} onSetTags={props.onSetTags} />
          <Duration
            duration={recipe.duration}
            onSetDuration={props.onSetDuration}
          />
          <Divider />
          <Ingredients
            ingredients={recipe.ingredients}
            onIngredient={props.onAddedIngredient}
            onRemove={props.onRemoveIngredient}
            onChangeQuantity={props.onChangeQuantity}
          />
        </div>
        <div className={"divider"}>
          <Notes value={recipe.notes} onBlur={props.onSetNote} />
        </div>
      </div>
      <Divider />
      <ButtonGroup>
        <Button
          label={editing ? "Save" : "Edit"}
          onClick={() => props.onSave(editing)}
        />
        {editing && (
          <Button label={"Cancel"} onClick={() => props.onCancel()} />
        )}
        {props.onAddToShoppinglist && (
          <AddToShoppinglist
            label={"Add to Shoppinglist"}
            token={token}
            onSelect={(shoppinglist) => {
              props.onAddToShoppinglist?.(shoppinglist.id);
            }}
          />
        )}
        {props.onAddToMealPlan && (
          <AddToMealPlan
            label={"Add to Mealplan"}
            token={token}
            onSelect={(plan) => {
              props.onAddToMealPlan?.(plan.id);
            }}
          />
        )}
      </ButtonGroup>
    </div>
  );
}

function Name(props: { value: string; onBlur: (name: string) => void }) {
  const { editing } = useContext(RecipeContext);
  const [name, setName] = useState(props.value);
  if (editing) {
    return (
      <Input
        onBlur={() => {
          if (props.value !== name) {
            props.onBlur(name);
          }
        }}
        type={"text"}
        onChange={setName}
        value={name}
        placeholder={"New Name..."}
      />
    );
  }
  return (
    <h1 className={"capitalize underline underline-offset-2"}>{props.value}</h1>
  );
}

function Notes(props: { value: string; onBlur: (v: string) => void }) {
  const [notes, setNotes] = useState(props.value);
  return (
    <>
      <h2>Notes:</h2>
      <textarea
        className={"w-full h-full"}
        placeholder={"Any notes?"}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={() => {
          if (props.value !== notes) {
            props.onBlur(notes);
          }
        }}
      />
    </>
  );
}

function Ingredients(props: {
  ingredients: UnstoredIngredient[];
  onIngredient: (i: OnlyIngredient, quantity: string) => void;
  onRemove: (name: UnstoredIngredient["ingredient"]["name"]) => void;
  onChangeQuantity: (
    name: UnstoredIngredient["ingredient"]["name"],
    quantity: string,
  ) => void;
}) {
  const { editing, token } = useContext(RecipeContext);
  return (
    <div className={"flex flex-col gap-2"}>
      <p className="uppercase">Ingredients:</p>
      <ul>
        {props.ingredients.map((ingredient) => {
          const quantity = humanize(ingredient.quantity[0]);
          const name = ingredient.ingredient.name;
          return (
            <IngredientView
              key={name}
              ingredient={name}
              quantity={quantity}
              onRemove={() => props.onRemove(name)}
              onChangeQuantity={(q) => props.onChangeQuantity(name, q)}
            />
          );
        })}
      </ul>
      {editing && (
        <SelectIngredientWithQuantity
          token={token}
          onIngredient={(ingredient, quantity) => {
            props.onIngredient(ingredient, humanize(quantity));
          }}
        />
      )}
    </div>
  );
}

function Duration(props: {
  duration: string | null;
  onSetDuration: (v: string) => void;
}) {
  const { editing } = useContext(RecipeContext);
  const [duration, setDuration] = useState(props.duration);
  if (editing) {
    return (
      <>
        <p>Duration: </p>
        <Input
          className={"inline"}
          onChange={setDuration}
          type={"text"}
          value={duration || "..."}
          onBlur={() => (duration ? props.onSetDuration(duration) : {})}
        />
      </>
    );
  }
  if (props.duration) {
    return <p>Duration: {props.duration}</p>;
  }
  return null;
}

function Tags(props: {
  tags: string[];
  onSetTags: (items: string[]) => void;
}) {
  const { editing, token } = useContext(RecipeContext);
  const allRecipeTags = useRecipeTags(token);
  if (!allRecipeTags.data) {
    return null;
  }

  return (
    <ol className={"flex flex-row gap-2"}>
      {props.tags.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
      {editing && (
        <MultiSelect
          label={"Select Tags"}
          items={allRecipeTags.data.tags}
          selected={props.tags}
          onItemsSelected={props.onSetTags}
          onNewItem={(newTag) => props.onSetTags([...props.tags, newTag])}
        />
      )}
    </ol>
  );
}

export function Stars(props: {
  rating: number;
  setRating: (n: number) => void;
}) {
  function Star(props: { rating: number; idx: number; onClick: () => void }) {
    const css = props.idx <= props.rating ? "text-amber-500" : "text-gray-300";
    return (
      <span
        className={`cursor-pointer ${css}  hover:text-amber-600`}
        onClick={props.onClick}
      >
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

type IngredientViewProps = {
  ingredient: UnstoredIngredient["ingredient"]["name"];
  quantity: string;
  onRemove: () => void;
  onChangeQuantity: (quantity: string) => void;
};

function IngredientView(props: IngredientViewProps) {
  const { editing } = useContext(RecipeContext);
  return (
    <li className="flex flex-row justify-between">
      {editing && (
        <DeleteButton
          className={"text-red-700 mr-2"}
          onClick={props.onRemove}
        />
      )}
      <p className="font-light text-gray-700 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {props.ingredient}
      </p>
      <DottedLine />
      {editing ? (
        <Input
          type={"text"}
          value={props.quantity}
          onChange={() => {}}
          onBlur={props.onChangeQuantity}
        />
      ) : (
        <p className="text-light" style={{ flex: "none" }}>
          {props.quantity}
        </p>
      )}
    </li>
  );
}

function BookSource(props: {
  token: string;
  source: { page: number | null; title: string | null };
  onTitleChange: (title: string) => void;
  onPageChange: (page: number) => void;
  onBlur: () => void;
}) {
  const recipes = useAllRecipes(props.token);
  if (recipes.error || !recipes.data) {
    return <p>Loading...</p>;
  }

  const names = recipes.data.recipes.flatMap((recipe) =>
    recipe.title ? [{ name: recipe.title }] : [],
  );

  console.log(names);

  return (
    <>
      <Dropdown
        items={names}
        onSelectedItem={({ name }) => props.onTitleChange(name)}
        onNewItem={(name) => props.onTitleChange(name)}
        placeholder={"The book title"}
      />
      <span>
        p.
        <Input
          type={"number"}
          placeholder={"...page..."}
          value={props.source.page || 0}
          onChange={(value) => props.onPageChange(Number.parseInt(value))}
          onBlur={props.onBlur}
        />
      </span>
    </>
  );
}

// TODO: move this back into the normal show recipes
function ShowSource(props: {
  token: string;
  recipe: UnstoredRecipe;
  onBlur: (details: Source) => void;
}) {
  const { editing } = useContext(RecipeContext);
  const [sourceChoice, setSourceChoice] = useState(props.recipe.source);

  const [source, setSource] = useState({
    url: props.recipe.url,
    page: props.recipe.page,
    title: props.recipe.title,
  });

  const propagate = () => {
    props.onBlur({ ...source, source: sourceChoice });
  };

  if (editing) {
    return (
      <div>
        <div className={"flex flex-row gap-2"}>
          <Labeled label={"Book"} htmlFor={"book"}>
            <input
              type="radio"
              id="book"
              name="book"
              value="book"
              checked={sourceChoice === "book"}
              onChange={() => setSourceChoice("book")}
            />
          </Labeled>
          <Labeled label={"Website"} htmlFor={"website"}>
            <input
              type="radio"
              id="website"
              name="website"
              value="website"
              checked={sourceChoice === "website"}
              onChange={() => setSourceChoice("website")}
            />
          </Labeled>
        </div>
        {sourceChoice === "website" && (
          <Input
            type={"text"}
            placeholder={"The URL"}
            value={source.url || ""}
            onChange={(url) => setSource((prev) => ({ ...prev, url }))}
            onBlur={propagate}
          />
        )}
        {sourceChoice === "book" && (
          <div className={"flex gap-2 flex-row"}>
            <BookSource
              token={props.token}
              source={source}
              onTitleChange={(title) =>
                setSource((prev) => ({ ...prev, title }))
              }
              onPageChange={(page) => setSource((prev) => ({ ...prev, page }))}
              onBlur={propagate}
            />
          </div>
        )}
      </div>
    );
  }
  switch (sourceChoice) {
    case "website": {
      const url = source.url || "";
      return (
        <a target="_blank" href={url} rel="noreferrer">
          {maybeHostname(url)}
        </a>
      );
    }
    case "book": {
      return (
        <div className="flex gap-2 flex-row">
          <p className="mr-4">{source.title}</p>
          <p>{`p.${source.page}`}</p>
        </div>
      );
    }
  }
}

function maybeHostname(v: string): string {
  try {
    return new URL(v).hostname;
  } catch (err) {
    return v;
  }
}

type InputProps = {
  placeholder?: string;
  onChange: (v: string) => void;
  className?: string;
} & (
  | { type: "text"; value: string; onBlur: (v: string) => void }
  | { type: "number"; value: number; onBlur: (v: number) => void }
);

function Input(props: InputProps) {
  const [value, setValue] = useState(props.value);
  return (
    <input
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        props.onChange(v);
      }}
      onBlur={() =>
        props.type === "text"
          ? props.onBlur(value as string)
          : props.onBlur(value as number)
      }
      autoComplete={"off"}
      placeholder={props.placeholder}
      type={props.type}
      value={value}
      className={classNames(
        props.className,
        "border-none bg-transparent outline-2 -outline-offset-2 outline-dashed outline-amber-400 focus:outline",
      )}
    />
  );
}
