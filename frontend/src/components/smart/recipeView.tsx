import { createContext, useContext, useState } from "react";
import type { Ingredient as OnlyIngredient } from "../../apis/ingredients.ts";
import {
  type Book,
  type Source,
  type UnstoredIngredient,
  type UnstoredRecipe,
  type Website,
  useRecipeTags,
} from "../../apis/recipes.ts";
import type { Ingredient } from "../../apis/recipes.ts";
import type { Shoppinglist } from "../../apis/shoppinglists.ts";
import { humanize } from "../../quantities.ts";
import { Button } from "../button.tsx";
import { ButtonGroup } from "../buttonGroup.tsx";
import { DeleteButton } from "../deleteButton.tsx";
import { Divider } from "../divider.tsx";
import { DottedLine } from "../dottedLine.tsx";
import { MultiSelect } from "../multiselect.tsx";
import { AddToShoppinglist } from "./addToShoppinglist.tsx";
import { SelectIngredientWithQuantity } from "./selectIngredientWithQuantity.tsx";

export const RecipeContext = createContext({
  editing: false,
  token: "",
});

type RecipeViewProps = {
  recipe: UnstoredRecipe;
  onSave: (isEditing: boolean) => void;
  onSetName: (name: string) => void;
  onSetSource: (source: Source) => void;
  onSetRating: (rating: number) => void;
  // TODO: string here sucks...
  onSetTags: (tags: string[]) => void;
  // TODO: string here sucks...
  onAddedIngredient: (ingredient: OnlyIngredient, quantity: string) => void;
  onRemoveIngredient: (id: Ingredient["name"]) => void;
  onSetNote: (notes: string) => void;
  onAddToShoppinglist?: (shoppinglistId: Shoppinglist["id"]) => void;
  onAddtoMealPlan?: () => void;
};
export function RecipeView(props: RecipeViewProps) {
  const { editing, token } = useContext(RecipeContext);
  // const id = props.recipe.id;

  // const setRating = useSetRecipeRating(token, id);
  // const setNotes = useSetRecipeNotes(token, id);
  // const addIngredient = useAddIngredient(token, id);
  // const removeIngredient = useDeleteIngredient(token, id);

  // // TODO: get rid of the 1
  // const addMealToPlan = useAddMealToPlan(token, 1);
  // const addRecipe = addRecipeToShoppinglist(token);

  // const setTags = useSetRecipeTags(token, id);

  const recipe = props.recipe;

  return (
    <div className="content-grid space-y-4 pb-20">
      <div className={"grid gap-4 grid-cols-1 sm:grid-cols-2"}>
        {/* left or top */}
        <div>
          <Name value={recipe.name} onBlur={props.onSetName} />
          <ShowSource recipe={recipe} onBlur={props.onSetSource} />
          <Stars rating={recipe.rating} setRating={props.onSetRating} />
          <Tags tags={recipe.tags} onSetTags={props.onSetTags} />
          <Divider />
          <Ingredients
            ingredients={recipe.ingredients}
            onIngredient={props.onAddedIngredient}
            onRemove={props.onRemoveIngredient}
          />
        </div>
        <div>
          <Notes value={recipe.notes} onBlur={props.onSetNote} />
        </div>
      </div>
      <Divider />
      <ButtonGroup>
        <Button
          label={editing ? "Save" : "Edit"}
          onClick={() => props.onSave(editing)}
        />
        {props.onAddToShoppinglist && (
          <AddToShoppinglist
            label={"Add to Shoppinglist"}
            token={token}
            onSelect={(shoppinglist) => {
              props.onAddToShoppinglist?.(shoppinglist.id);
            }}
          />
        )}
        {props.onAddtoMealPlan && (
          <Button
            label={"Add to Meal plan"}
            onClick={() => props.onAddtoMealPlan?.()}
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
  onRemove: (name: UnstoredIngredient["name"]) => void;
}) {
  const { editing, token } = useContext(RecipeContext);
  return (
    <div className={"flex flex-col gap-2"}>
      <p className="uppercase">Ingredients:</p>
      <ul>
        {props.ingredients.map((ingredient) => {
          const quantity = humanize(ingredient.quantity[0]);
          return (
            <IngredientView
              key={ingredient.name}
              ingredient={ingredient}
              quantity={quantity}
              onRemove={() => props.onRemove(ingredient.name)}
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

function Stars(props: { rating: number; setRating: (n: number) => void }) {
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
  ingredient: Pick<UnstoredIngredient, "name">;
  quantity: string;
  onRemove: () => void;
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
        {props.ingredient.name}
      </p>
      <DottedLine />
      {editing ? (
        <Input
          type={"text"}
          value={props.quantity}
          onChange={() => {}}
          onBlur={() => {}}
        />
      ) : (
        <p className="text-light" style={{ flex: "none" }}>
          {props.quantity}
        </p>
      )}
    </li>
  );
}

// TODO: move this back into the normal show recipes
function ShowSource(props: {
  recipe: UnstoredRecipe;
  onBlur: (details: Source) => void;
}) {
  const { editing } = useContext(RecipeContext);
  const [sourceChoice, setSourceChoice] = useState(props.recipe.source);

  const [source, setSource] = useState(props.recipe as unknown as Source);

  const propagate = () => {
    props.onBlur(source);
  };

  if (editing) {
    return (
      <div>
        <div>
          <input
            type="radio"
            id="book"
            name="book"
            value="book"
            checked={sourceChoice === "book"}
            onChange={() => setSourceChoice("book")}
          />
          <label htmlFor="book">Book</label>
          <input
            type="radio"
            id="website"
            name="website"
            value="website"
            checked={sourceChoice === "website"}
            onChange={() => setSourceChoice("website")}
          />
          <label htmlFor="website">Website</label>
        </div>

        {sourceChoice === "website" && (
          <Input
            type={"text"}
            placeholder={"The URL"}
            value={(source as Website).url || ""}
            onChange={(url) => setSource((prev) => ({ ...prev, url }))}
            onBlur={propagate}
          />
        )}
        {sourceChoice === "book" && (
          <div className={"flex gap-2 flex-row"}>
            <Input
              type={"text"}
              placeholder={"The book title"}
              value={(source as Book).title}
              onChange={(title) => setSource((prev) => ({ ...prev, title }))}
              onBlur={propagate}
            />
            <span>
              p.
              <Input
                type={"number"}
                placeholder={"...page..."}
                value={(source as Book).page}
                onChange={(page) =>
                  setSource((prev) => ({
                    ...prev,
                    page: Number.parseInt(page),
                  }))
                }
                onBlur={propagate}
              />
            </span>
          </div>
        )}
      </div>
    );
  }
  switch (sourceChoice) {
    case "website": {
      const url = (source as Website).url;
      return (
        <a target="_blank" href={url} rel="noreferrer">
          {maybeHostname(url)}
        </a>
      );
    }
    case "book": {
      const book = source as Book;
      return (
        <div className="flex gap-2 flex-row">
          <p className="mr-4">{book.title}</p>
          <p>{`p.${book.page}`}</p>
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
  onBlur?: () => void;
} & ({ type: "text"; value: string } | { type: "number"; value: number });

function Input(props: InputProps) {
  return (
    <input
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={() => props.onBlur?.()}
      autoComplete={"off"}
      placeholder={props.placeholder}
      type={props.type}
      value={props.value}
      className={
        "border-none bg-transparent outline-2 -outline-offset-2 outline-dashed outline-amber-400 focus:outline"
      }
    />
  );
}
