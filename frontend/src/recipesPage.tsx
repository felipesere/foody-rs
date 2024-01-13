import {useState} from "react";
import * as classNames from "classnames";

type Recipe = {
    id: number
    source: "book" | "website"
    name: string
    title?: string
    page?: number
    url?: string
    ingredients: Ingredient[],
}

type Ingredient = {
    id: number
    name: string
    quantity: Quantity[]
}

type Quantity = {
    unit: string
    value?: number
    text?: string
    id: number
}

export function Recipes() {
    const recipes: Recipe[] = [
        {
            id: 32,
            source: "book",
            name: "All-In-One Paella with chicken, peppers \u0026 chorizo",
            title: "Red Roasting Tin",
            page: 186,
            ingredients: [
                {
                    id: 310,
                    name: "red onion",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 328,
                        },
                    ],
                },
                {
                    id: 467,
                    name: "red peppers",
                    quantity: [
                        {
                            unit: "count",
                            value: 2,
                            id: 329,
                        },
                    ],
                },
                {
                    id: 468,
                    name: "cloves of garlic",
                    quantity: [
                        {
                            unit: "count",
                            value: 2,
                            id: 330,
                        },
                    ],
                },
                {
                    id: 469,
                    name: "free range chicken thighs",
                    quantity: [
                        {
                            unit: "count",
                            value: 6,
                            id: 331,
                        },
                    ],
                },
                {
                    id: 59,
                    name: "chorizo",
                    quantity: [
                        {
                            unit: "gram",
                            value: 150,
                            id: 332,
                        },
                    ],
                },
                {
                    id: 470,
                    name: "saffron",
                    quantity: [
                        {
                            unit: "arbitrary",
                            text: "4 pinches",
                            id: 333,
                        },
                    ],
                },
                {
                    id: 471,
                    name: "paella rice",
                    quantity: [
                        {
                            unit: "gram",
                            value: 250,
                            id: 334,
                        },
                    ],
                },
                {
                    id: 48,
                    name: "chicken stock",
                    quantity: [
                        {
                            unit: "millilitre",
                            value: 600,
                            id: 335,
                        },
                    ],
                },
                {
                    id: 376,
                    name: "lemon",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 336,
                        },
                    ],
                },
                {
                    id: 466,
                    name: "fresh parsley",
                    quantity: [
                        {
                            unit: "gram",
                            value: 20,
                            id: 337,
                        },
                    ],
                },
            ],
        },
        {
            id: 342,
            source: "website",
            name: "Baked Macaroni Cheese with Chorizo and Peppers",
            url: "https://cookidoo.co.uk/recipes/recipe/en-GB/r310420",
            ingredients: [
                {
                    id: 524,
                    name: "penne",
                    quantity: [
                        {
                            unit: "gram",
                            value: 225,
                            id: 3293,
                        },
                    ],
                },
                {
                    id: 30,
                    name: "bread",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 3294,
                        },
                    ],
                },
                {
                    id: 407,
                    name: "cheddar cheese",
                    quantity: [
                        {
                            unit: "gram",
                            value: 250,
                            id: 3295,
                        },
                    ],
                },
                {
                    id: 392,
                    name: "butter",
                    quantity: [
                        {
                            unit: "gram",
                            value: 30,
                            id: 3296,
                        },
                    ],
                },
                {
                    id: 336,
                    name: "plain flour",
                    quantity: [
                        {
                            unit: "gram",
                            value: 40,
                            id: 3297,
                        },
                    ],
                },
                {
                    id: 404,
                    name: "milk",
                    quantity: [
                        {
                            unit: "gram",
                            value: 340,
                            id: 3298,
                        },
                    ],
                },
                {
                    id: 59,
                    name: "chorizo",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 3299,
                        },
                    ],
                },
                {
                    id: 483,
                    name: "fresh basil",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 3300,
                        },
                    ],
                },
                {
                    id: 559,
                    name: "Jar of red peppers",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 3301,
                        },
                    ],
                },
            ],
        },
        {
            id: 431,
            source: "book",
            name: "Cauliflower steaks with Harrisa \u0026 Goats Cheese",
            title: "Green roasting tin",
            page: 162,
            ingredients: [
                {
                    id: 42,
                    name: "cauliflower",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 4157,
                        },
                    ],
                },
                {
                    id: 310,
                    name: "red onion",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 4158,
                        },
                    ],
                },
                {
                    id: 581,
                    name: "Harisa",
                    quantity: [
                        {
                            unit: "arbitrary",
                            text: "4 table spoons",
                            id: 4159,
                        },
                    ],
                },
                {
                    id: 482,
                    name: "goats cheese",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 4160,
                        },
                    ],
                },
                {
                    id: 193,
                    name: "pine nuts",
                    quantity: [
                        {
                            unit: "gram",
                            value: 30,
                            id: 4161,
                        },
                    ],
                },
                {
                    id: 487,
                    name: "breadcrumbs",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 4162,
                        },
                    ],
                },
                {
                    id: 362,
                    name: "parsley",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 4163,
                        },
                    ],
                },
                {
                    id: 582,
                    name: "1x",
                    quantity: [
                        {
                            unit: "arbitrary",
                            text: "Giant cous-cous",
                            id: 4164,
                        },
                    ],
                },
            ],
        },
        {
            id: 356,
            source: "website",
            name: "Chicken Noodle Soup",
            url: "https://cookidoo.co.uk/recipes/recipe/en-GB/r154891",
            ingredients: [
                {
                    id: 339,
                    name: "onions",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 3450,
                        },
                    ],
                },
                {
                    id: 458,
                    name: "carrots",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 3451,
                        },
                    ],
                },
                {
                    id: 567,
                    name: "Celery stalks",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 3452,
                        },
                    ],
                },
                {
                    id: 568,
                    name: "Dried basil",
                    quantity: [
                        {
                            unit: "teaspoon",
                            value: 1,
                            id: 3453,
                        },
                    ],
                },
                {
                    id: 180,
                    name: "oregano",
                    quantity: [
                        {
                            unit: "teaspoon",
                            value: 1,
                            id: 3454,
                        },
                    ],
                },
                {
                    id: 351,
                    name: "bay leaves",
                    quantity: [
                        {
                            unit: "count",
                            value: 2,
                            id: 3455,
                        },
                    ],
                },
                {
                    id: 569,
                    name: "Egg noodles",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 3456,
                        },
                    ],
                },
                {
                    id: 570,
                    name: "cooked chicken meat",
                    quantity: [
                        {
                            unit: "gram",
                            value: 300,
                            id: 3457,
                        },
                    ],
                },
            ],
        },
        {
            id: 10,
            source: "book",
            name: "Courgette fritters in a salad",
            title: "Simplissime",
            page: 136,
            ingredients: [
                {
                    id: 221,
                    name: "rocket",
                    quantity: [
                        {
                            unit: "arbitrary",
                            text: "2 handfuls",
                            id: 112,
                        },
                    ],
                },
                {
                    id: 411,
                    name: "courgettes",
                    quantity: [
                        {
                            unit: "count",
                            value: 2,
                            id: 113,
                        },
                    ],
                },
                {
                    id: 360,
                    name: "eggs",
                    quantity: [
                        {
                            unit: "count",
                            value: 2,
                            id: 114,
                        },
                    ],
                },
                {
                    id: 361,
                    name: "flour",
                    quantity: [
                        {
                            unit: "gram",
                            value: 100,
                            id: 115,
                        },
                    ],
                },
                {
                    id: 414,
                    name: "beer",
                    quantity: [
                        {
                            unit: "millilitre",
                            value: 100,
                            id: 116,
                        },
                    ],
                },
                {
                    id: 166,
                    name: "mint",
                    quantity: [
                        {
                            unit: "arbitrary",
                            text: "10 leaves",
                            id: 117,
                        },
                    ],
                },
            ],
        },
        {
            id: 357,
            source: "website",
            name: "Creamy Asparagus, Potato and Leek Soup",
            url: "https://cookidoo.co.uk/recipes/recipe/en-GB/r85110",
            ingredients: [
                {
                    id: 339,
                    name: "onions",
                    quantity: [
                        {
                            unit: "gram",
                            value: 120,
                            id: 3458,
                        },
                    ],
                },
                {
                    id: 146,
                    name: "leeks",
                    quantity: [
                        {
                            unit: "gram",
                            value: 250,
                            id: 3459,
                        },
                    ],
                },
                {
                    id: 341,
                    name: "potatoes",
                    quantity: [
                        {
                            unit: "gram",
                            value: 200,
                            id: 3460,
                        },
                    ],
                },
                {
                    id: 5,
                    name: "asparagus",
                    quantity: [
                        {
                            unit: "gram",
                            value: 400,
                            id: 3461,
                        },
                    ],
                },
                {
                    id: 406,
                    name: "fresh thyme",
                    quantity: [
                        {
                            unit: "teaspoon",
                            value: 2,
                            id: 3462,
                        },
                    ],
                },
                {
                    id: 571,
                    name: "dried marjoram",
                    quantity: [
                        {
                            unit: "teaspoon",
                            value: 1,
                            id: 3463,
                        },
                    ],
                },
                {
                    id: 440,
                    name: "fresh chives",
                    quantity: [
                        {
                            unit: "gram",
                            value: 10,
                            id: 3464,
                        },
                    ],
                },
                {
                    id: 76,
                    name: "cream",
                    quantity: [
                        {
                            unit: "count",
                            value: 1,
                            id: 3465,
                        },
                    ],
                },
            ],
        },
        {
            id: 280,
            source: "book",
            name: "Crunchy Roast potato, Artichoke \u0026 Spring Green",
            title: "The Green Roasting Tin",
            page: 218,
            ingredients: [
                {
                    id: 341,
                    name: "potatoes",
                    quantity: [
                        {
                            unit: "gram",
                            value: 800,
                            id: 2716,
                        },
                    ],
                },
                {
                    id: 480,
                    name: "artichokes",
                    quantity: [
                        {
                            unit: "gram",
                            value: 560,
                            id: 2717,
                        },
                    ],
                },
                {
                    id: 333,
                    name: "garlic",
                    quantity: [
                        {
                            unit: "cloves",
                            value: 2,
                            id: 2718,
                        },
                    ],
                },
                {
                    id: 252,
                    name: "spring greens",
                    quantity: [
                        {
                            unit: "gram",
                            value: 200,
                            id: 2719,
                        },
                    ],
                },
                {
                    id: 360,
                    name: "eggs",
                    quantity: [
                        {
                            unit: "count",
                            value: 4,
                            id: 2720,
                        },
                    ],
                },
                {
                    id: 540,
                    name: "chili sauce",
                    quantity: [
                        {
                            unit: "teaspoon",
                            value: 1,
                            id: 2721,
                        },
                    ],
                },
                {
                    id: 541,
                    name: "natural yogurt",
                    quantity: [
                        {
                            unit: "tablespoon",
                            value: 3,
                            id: 2722,
                        },
                    ],
                },
            ],
        },
    ];
    return (
        <div className="content-grid container">
            <ul role="list" className="recipes">
                {recipes.map(recipe => <RecipeView key={recipe.name} recipe={recipe}/>)}
            </ul>
        </div>
    )
}

type RecipeProps = {
    recipe: Recipe,
}

function RecipeView(props: RecipeProps) {
    const [open, setOpen] = useState(false)
    return (
        <li className="small-padding black-border">
            <p className="heavy-text">{props.recipe.name}</p>
            <div>
                {props.recipe.source == "book" ?
                    <BookSource title={props.recipe.title!} page={props.recipe.page!}/> : null}
                {props.recipe.source == "website" ? <WebsiteSource url={props.recipe.url!}/> : null}
            </div>
            {open ? (
                <div>
                    <hr/>
                    <p className="uppercase">Ingredients:</p>
                    <ul role="list">
                        {props.recipe.ingredients.map(ingredient => <IngredientView key={ingredient.name} ingredient={ingredient}/>)}
                    </ul>
                </div>
            ) : null}
            <div className="h-stack">
                <button className={classNames({
                    "double-border": open,
                    "shadow": !open,
                })} onClick={() => {
                    setOpen(o => !o)
                }}>
                    Details
                </button>
                <button className="secondary shadow">Add</button>
                <button className="danger shadow">Delete</button>
            </div>
        </li>
    )
}

function IngredientView({ingredient}: { ingredient: Ingredient }) {
    return (
        <li className="horizontal space-between">
            <p
                className="text-light ellipsis"
            >{ingredient.name}</p>
            <div className="dotted-line"></div>
            <p
                className="text-light"
                style={{flex: "none"}}
            >{ingredient.quantity[0].value} {ingredient.quantity[0].unit}</p>
        </li>

    )
}

function BookSource(props: { title: string, page: number }) {
    return (
        <div className="horizontal">
            <p className="recipe_book_title">{props.title}</p>
            <p>{`p.${props.page}`}</p>
        </div>
    )
}

function WebsiteSource(props: { url: string }) {
    return (
        <a
            target="_blank"
            href={props.url}
        >{new URL(props.url).hostname}</a>
    )
}
