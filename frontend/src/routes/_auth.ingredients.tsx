import {createFileRoute, useNavigate} from "@tanstack/react-router";
import classnames from "classnames";
import {useRef, useState} from "react";
import {toast} from "sonner";
import {z} from "zod";
import {
    addIngredientToShoppinglist,
    type Ingredient,
    useAllIngredients,
    useAllIngredientTags,
    useSetIngredientTags,
} from "../apis/ingredients.ts";
import {Button} from "../components/button.tsx";
import {ButtonGroup} from "../components/buttonGroup.tsx";
import {Divider} from "../components/divider.tsx";
import {FieldSet} from "../components/fieldset.tsx";
import {MultiSelect} from "../components/multiselect.tsx";
import {ResizingInput} from "../components/resizeableInput.tsx";
import {AddToShoppinglist} from "../components/smart/addToShoppinglist.tsx";
import {SelectAisle} from "../components/smart/selectAisle.tsx";
import {SelectTags} from "../components/smart/selectTags.tsx";
import {TagsTable} from "../components/tags.tsx";
import {ToggleButton} from "../components/toggle.tsx";
import {orderByTag} from "../domain/orderByTag.ts";
import * as sea from "node:sea";

const ingredientSearchSchema = z.object({
    search: z
        .object({
            tags: z.array(z.string()).optional(),
            aisle: z.array(z.string()).optional(),
        })
        .optional(),
    massEditTags: z.boolean().optional(),
});

type IngredientSearch = z.infer<typeof ingredientSearchSchema>;

export const Route = createFileRoute("/_auth/ingredients")({
    component: IngredientsPage,
    validateSearch: ingredientSearchSchema,
});

function updateSearch(change: IngredientSearch["search"]) {
    return (params: IngredientSearch) => {
        const search = {
            ...params.search,
            ...change,
        }
        if (!search.aisle && !search.tags) {
            return {
                ...params,
                search: undefined,
            }
        }

        return {
            ...params,
            search,
        }

    }
}

function IngredientsPage() {
    const {token} = Route.useRouteContext();
    const {search, massEditTags} = Route.useSearch();
    const navigate = useNavigate({from: Route.path});
    const ingredients = useAllIngredients(token);
    const allTags = useAllIngredientTags(token);

    if (!ingredients.data || !allTags.data) {
        return <p>Loading...</p>;
    }

    const allAisles = new Set(
        ingredients.data.filter((i) => i.aisle).map((i) => i.aisle!.name),
    );

    // TODO: Extract into function
    const filteredIngredients = ingredients.data.filter((ingredient) => {
        if (search?.tags) {
            if (!search.tags.some((tag) => ingredient.tags.includes(tag))) {
                return false;
            }
        }
        if (search?.aisle && ingredient.aisle) {
            if (!search.aisle.includes(ingredient.aisle.name)) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="content-grid">
            <FieldSet className={{fieldSet: "flex-wrap"}}>
                <ButtonGroup>
                    <Button
                        label={"Mass edit tags"}
                        onClick={() =>
                            navigate({
                                to: ".",
                                search: (params) => {
                                    return {
                                        ...params,
                                        massEditTags: massEditTags ? undefined : true,
                                    };
                                },
                            })
                        }
                    />
                </ButtonGroup>
                <FieldSet legend={"Filter"}>
                    <MultiSelect
                        label={"Select tags"}
                        selected={search?.tags || []}
                        items={allTags.data.tags}
                        onItemsSelected={(items) => {
                            navigate({
                                to: ".",
                                search: updateSearch({tags: items.length ? items : undefined})
                            });
                        }}
                        hotkey={"ctrl+t"}
                    />
                    <MultiSelect
                        label={"Select aisle"}
                        selected={search?.aisle || []}
                        items={Array.from(allAisles)}
                        onItemsSelected={(items) => {
                            navigate({
                                to: ".",
                                search: updateSearch({aisle: items.length ? items : undefined})
                            });
                        }}
                        hotkey={"ctrl+a"}
                    />
                </FieldSet>
            </FieldSet>
            {massEditTags ? (
                <MassEditTags token={token} ingredients={filteredIngredients}/>
            ) : (
                <Overview token={token} ingredients={filteredIngredients}/>
            )}
        </div>
    );
}

function Overview(props: { ingredients: Ingredient[]; token: string }) {
    const sections = orderByTag(props.ingredients);
    sections.sort((a, b) => a.items.length - b.items.length);

    return (
        <ul className="gap-4 columns-xs space-y-10 mt-4">
            {sections.map((section) => {
                return (
                    <div key={section.name} className={"flex flex-col"}>
                        <p className={"font-black"}>{section.name}</p>
                        <ol className="space-y-2">
                            {section.items.map((ingredient) => {
                                return (
                                    <IngredientView
                                        key={ingredient.name}
                                        ingredient={ingredient}
                                        selected={false}
                                        token={props.token}
                                        onClick={() => {
                                        }}
                                    />
                                );
                            })}
                        </ol>
                    </div>
                );
            })}
        </ul>
    );
}

type IngredientViewProps = {
    ingredient: Ingredient;
    token: string;
    selected: boolean;
    onClick: () => void;
};

function IngredientView(props: IngredientViewProps) {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [temporaryName, setTemporaryName] = useState<string>("");

    const [isDirty, setIsDirty] = useState(false);
    const anyTags = props.ingredient.tags.length > 0;
    const addIngredient = addIngredientToShoppinglist(props.token);
    return (
        <li
            className={classnames("p-2 border-solid border-2", {
                "border-black": !props.selected,
                "border-yellow-400": props.selected,
            })}
        >
            <div
                onClick={props.onClick}
                className={"flex flex-row gap-1 font-black align-middle"}
            >
                <ToggleButton
                    onToggle={() => {
                        if (open) {
                            setEdit(false);
                        }
                        setOpen((b) => !b);
                    }}
                    open={open}
                />
                <ResizingInput
                    readOnly={!edit}
                    name={"ingredient"}
                    boxClassName={"flex-grow"}
                    className={"uppercase tracking-wider"}
                    onChange={(v) => {
                        setTemporaryName(v.target.value);
                        setIsDirty(true);
                    }}
                    value={isDirty ? temporaryName : props.ingredient.name}
                />
                <AddToShoppinglist
                    token={props.token}
                    onSelect={(shoppinglist) => {
                        addIngredient.mutate({
                            shoppinglistId: shoppinglist.id,
                            ingredient: props.ingredient.name,
                            quantity: [
                                {
                                    unit: "count",
                                    value: 1,
                                },
                            ],
                        });
                        toast(
                            `Added "${props.ingredient.name}" to shoppinglist "${shoppinglist.name}"`,
                        );
                    }}
                />
            </div>
            {open && (
                <>
                    <Divider/>
                    <div className={"flex flex-row gap-4"}>
                        <p>Tags:</p>
                        {anyTags
                            ? props.ingredient.tags.map((t) => <p key={t}>{t}</p>)
                            : "None"}
                        {edit && (
                            <SelectTags
                                token={props.token}
                                ingredientId={props.ingredient.id}
                                currentTags={props.ingredient.tags}
                            />
                        )}
                    </div>
                    <Divider/>
                    <div className={"flex flex-row gap-4"}>
                        <p>Aisle:</p>
                        {props.ingredient.aisle?.name || "None"}
                        {edit && (
                            <SelectAisle
                                token={props.token}
                                ingredientId={props.ingredient.id}
                                currentAisle={props.ingredient.aisle?.name ?? null}
                            />
                        )}
                    </div>
                    <Divider/>
                    <ButtonGroup>
                        <Button
                            label={"Edit"}
                            hotkey={"ctrl+e"}
                            onClick={() => {
                                setEdit((e) => !e);
                            }}
                            type={"button"}
                            classNames={{"border-amber-400": edit}}
                        />
                        <Button
                            label={"Reset"}
                            hotkey={"ctrl+r"}
                            type="button"
                            onClick={() => {
                            }}
                        />
                    </ButtonGroup>
                </>
            )}
        </li>
    );
}

function MassEditTags(props: { token: string; ingredients: Ingredient[] }) {
    let ingredients = props.ingredients;
    const [newTags, setNewTags] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateTags = useSetIngredientTags(props.token);

    let tags = ingredients
        .flatMap((i) => i.tags)
        .sort()
        .filter((x, i, a) => a.indexOf(x) == i);

    let knownTags = new Set([...tags, ...newTags]);

    return (
        <div className={"mt-4"}>
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
                items={ingredients}
                knownTags={Array.from(knownTags.values())}
                toggleTags={(id, tags) => {
                    updateTags.mutate({
                        id,
                        tags,
                    });
                }}
            />
        </div>
    );
}
