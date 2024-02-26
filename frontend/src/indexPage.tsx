import classnames from "classnames";
import { useState } from "react";

export function IndexPage() {
  const ingredients = [
    {
      name: "aubergine",
      quantity: "6x",
      parts: [
        { name: "parmigiana", quantity: "4x" },
        { name: "fried aubergine", quantity: "1x" },
        { name: "manual", quantity: "1x" },
      ],
      aisle: "vegetables",
    },
    {
      name: "apples",
      quantity: "12x",
      parts: [{ name: "manual", quantity: "12x" }],
      aisle: "vegetables",
    },
    {
      name: "tomatoes",
      quantity: "1kg",
      parts: [
        { name: "gnocci al tomato", quantity: "500g" },
        { name: "manual", quantity: "500g" },
      ],
      aisle: "vegetables",
    },
    {
      name: "milk",
      quantity: "2 pints",
      parts: [{ name: "pancakes", quantity: "2 pints" }],
      aisle: "dairy",
    },
  ];
  return (
    <div className="content-grid">
      <ul className="shoppinglist">
        {ingredients.map((ingredient) => (
          <Ingredient key={ingredient.name} ingredient={ingredient} />
        ))}
      </ul>
    </div>
  );
}

type Ingredient = {
  name: string;
  aisle: string;
  quantity: string;
  parts: Part[];
};

type Part = {
  name: string;
  quantity: string;
};

function Ingredient({ ingredient }: { ingredient: Ingredient }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <li
      className={classnames(
        "shadow black-border small-padding span-2-columns",
        { subgrid: !open },
      )}
    >
      <div className="card__content">
        <div className="vertical">
          <div className="horizontal">
            <input
              className="checkbox"
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((checked) => !checked)}
            />
            <p
              className={classnames("ingredient", "heavy-text", {
                strikethrough: checked,
              })}
            >
              {ingredient.name}
            </p>
          </div>
          <hr />
          {!open && (
            <div className="horizontal space-between light-text">
              <p>Quantity:</p>
              <p>{ingredient.quantity}</p>
            </div>
          )}
          {open && (
            <div className={"details__extended"}>
              <p>Parts:</p>
              <ol>
                {ingredient.parts.map((part) => (
                  <Part key={part.name} part={part} />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      <div className={"card__extras"}>
        {!open ? <p className={"light-text"}>{ingredient.aisle}</p> : null}
        <button
          className={classnames("bottom", {
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
      </div>
    </li>
  );
}

type PartProps = {
  part: Part;
};

function Part(props: PartProps) {
  const [checked, setChecked] = useState(false);
  return (
    <li className="light-text horizontal space-between">
      <input
        type={"checkbox"}
        checked={checked}
        onChange={() => setChecked((checked) => !checked)}
      />
      <p
        className={classnames("text-light ellipsis ml-1", {
          strikethrough: checked,
        })}
      >
        {props.part.name}
      </p>
      <div className="dotted-line" />
      <p className="text-light">{props.part.quantity}</p>
    </li>
  );
}
