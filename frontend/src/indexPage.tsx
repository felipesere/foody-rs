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
      <ul className="grid max-w-md gap-4">
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
        "shadow border-black border-solid border-2 p-2 col-span-2",
        { "grid grid-cols-subgrid": !open },
      )}
    >
      <div className="flex-grow">
        <div className="flex flex-col">
          <div className="flex flex-row">
            <input
              className="checkbox"
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((checked) => !checked)}
            />
            <p
              className={classnames(
                "capitalize ml-2 font-black tracking-wider",
                {
                  "line-through": checked,
                },
              )}
            >
              {ingredient.name}
            </p>
          </div>
          <hr className={"w-full border-t border-solid border-black"} />
          {!open && (
            <div className="flex flex-row justify-between font-light">
              <p>Quantity:</p>
              <p>{ingredient.quantity}</p>
            </div>
          )}
          {open && (
            <div>
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
      <div className={"flex flex-col justify-between"}>
        {!open ? <p className={"font-light"}>{ingredient.aisle}</p> : null}
        <button
          className={classnames({
            "border-black border-double border-4": open,
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
    <li className="font-light flex flex-row justify-between">
      <input
        type={"checkbox"}
        checked={checked}
        onChange={() => setChecked((checked) => !checked)}
      />
      <p
        className={classnames("text-ellipsis ml-2", {
          "line-through": checked,
        })}
      >
        {props.part.name}
      </p>
      <div className="dotted-line" />
      <p>{props.part.quantity}</p>
    </li>
  );
}
