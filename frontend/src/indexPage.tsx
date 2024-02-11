import {useState} from "react";
import classNames from "classnames";

export function IndexPage() {
    const ingredients = [
        {
            name: "aubergine",
            quantity: "6x",
            parts: [
                {name: "parmigiana", quantity: "4x"},
                {name: "fried aubergine", quantity: "1x"},
                {name: "manual", quantity: "1x"},
            ],
            aisle: "vegetables",
        },
        {
            name: "apples",
            quantity: "12x",
            parts: [{name: "manual", quantity: "12x"}],
            aisle: "vegetables",
        },
        {
            name: "tomatoes",
            quantity: "1kg",
            parts: [
                {name: "gnocci al tomato", quantity: "500g"},
                {name: "manual", quantity: "500g"},
            ],
            aisle: "vegetables",
        },
        {
            name: "milk",
            quantity: "2 pints",
            parts: [{name: "pancakes", quantity: "2 pints"}],
            aisle: "dairy",
        },
    ];
    return (
        <div className="content-grid">
            <ul role="list" className="shoppinglist">
                {ingredients.map((ingredient) => <Ingredient key={ingredient.name} ingredient={ingredient}/>)}
            </ul>
        </div>
    )
}


type Ingredient = {
    name: string,
    aisle: string,
    quantity: string,
    parts: Part[],
}

type Part = {
    name: string,
    quantity: string
}

function Ingredient({ingredient}: { ingredient: Ingredient }) {
    let [open, setOpen] = useState(false)
    let [edit, setEdit] = useState(false)

    return (
        <li
            className="subgrid shadow black-border small-padding"
        >
            <div className="card__content">
                <div className="vertical">
                    <div className="horizontal">
                        <input className="checkbox" type="checkbox"/>
                        <p className="ingredient heavy-text">{ingredient.name}</p>
                    </div>
                    <hr/>
                    {!open &&
                        <div className="horizontal space-between light-text">
                            <p>Quantity:</p>
                            <p>{ingredient.quantity}</p>
                        </div>
                    }
                    {open &&
                        <>
                            <ol role="list" className="details__extended">
                                {ingredient.parts.map((part) => <Part key={part.name} part={part} isEditing={edit}/>)}
                            </ol>
                            <button className={"bottom shadow"} onClick={() => setEdit((e) => !e)}>
                                {edit ? "Save" : "Edit"}
                            </button>
                        </>
                    }
                </div>
            </div>
            <div className={"card__extras"}>
                <p className={"light-text"}>{ingredient.aisle}</p>
                <button className={classNames("bottom", {
                    "double-border": open,
                    "shadow": !open,
                })} onClick={() => {
                    setOpen(o => !o)
                    setEdit(() => false)
                }}>
                    Details
                </button>
            </div>
        </li>)
}

type PartProps = {
    part: Part
    isEditing: boolean
}

function Part(props: PartProps) {
    return (
        <span className="light-text horizontal space-between">
         <p>{props.part.name}</p>
            {props.isEditing ? <input type="text" placeholder={props.part.quantity}/> : <p>{props.part.quantity}</p>}
       </span>
    )
}