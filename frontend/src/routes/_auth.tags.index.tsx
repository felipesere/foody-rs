import {createFileRoute} from "@tanstack/react-router";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Ingredient, useAllIngredients, useSetIngredientTags} from "../apis/ingredients.ts";
import {useMemo, useRef, useState} from "react";
import {Pill} from "../components/pill.tsx";
import {FieldSet} from "../components/fieldset.tsx";

export const Route = createFileRoute("/_auth/tags/")({
    component: RouteComponent,
});

function RouteComponent() {
    const {token} = Route.useRouteContext();

    let ingredients = useAllIngredients(token)

    const setTags = useSetIngredientTags(token)

    const [newTags, setNewTags] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null);
    const [batchEdit, setBatchEdit] = useState(false);

    if (
        !ingredients.data ||
        ingredients.isLoading
    ) {
        return <p>Loading</p>;
    }

    let tags = ingredients.data.flatMap((i) => i.tags).sort().filter((x, i, a) => a.indexOf(x) == i);

    let knownTags = new Set([...tags, ...newTags]);

    return (
        <div className="content-grid space-y-4">
            <FieldSet>
                <button className={"px-2"} onClick={() => setBatchEdit((v) => !v)}>Toggle Batch Edit</button>
                <p>New tags</p>
                <input className={"px-2 border-2"} type={"text"} ref={inputRef}/>
                <button className={"px-2"} type={"button"} onClick={() => {
                    let newTag = inputRef.current?.value
                    if (newTag) {
                        setNewTags((prevTags) => [...prevTags, newTag])
                    }
                }}>Add
                </button>
                <ul className={"flex flex-row flex-wrap gap-2"}>
                    {newTags.map((tag) => <li><Pill value={tag} onClose={(thisTag) => {
                        setNewTags((prevTags) => prevTags.filter((tag) => tag !== thisTag))
                    }}/></li>)}
                </ul>
            </FieldSet>
            <TagsTable
                batchEdit={batchEdit}
                ingredients={ingredients.data}
                knownTags={Array.from(knownTags.values())}
                toggleTags={(id, tags) => {
                    setTags.mutate({tags, id})
                }}/>
        </div>
    );
}


function TagsTable(props: {
    ingredients: Ingredient[],
    knownTags: string[],
    toggleTags: (ingredient: Ingredient["id"], tags: string[]) => void,
    batchEdit: boolean,
}) {

    const batchEdit = props.batchEdit;
    const knownTags = props.knownTags;
    const toggleTags = props.toggleTags
    const helper = createColumnHelper<Ingredient>()

    const columns = useMemo(() => [
        helper.accessor("name", {
            header: "Name",
            cell: cell => <td className={"p-2"}>{cell.row.original.name}</td>
        }),
        helper.accessor("tags", {
            header: "Tags",
            cell: cell => {
                const ingredient = cell.row.original;
                let batchTags = knownTags.map(t => {
                    const existingTag = ingredient.tags.includes(t)
                    const color = existingTag ? `text-black` : `text-gray-400`;
                    const tags = existingTag ? ingredient.tags.filter(tag => tag != t) : [...ingredient.tags, t]

                    return (<span onClick={() => toggleTags(ingredient.id, tags)}
                                  className={`bg-white border-2 px-2 mr-2 ${color}`}>{t}</span>)
                })
                let ownTags = ingredient.tags.map((t) => {
                    return (<span className={`bg-white border-2 px-2 mr-2`}>{t}</span>)
                })
                return (
                    <td className={"p-2 flex flex-row gap-2 flex-wrap"}>
                        {batchEdit ? batchTags : ownTags}
                    </td>
                )
            }
        }),
    ], [helper, batchEdit, knownTags]);

    const table = useReactTable({
        columns,
        data: props.ingredients,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className={`w-full`}>
            <table className={"w-full border-spacing-2 border-collapse text-left"}>
                <thead>
                <tr>
                    <th className={"p-2"}>Name</th>
                    <th className={"p-2"}>Tags</th>
                </tr>
                </thead>
                <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className={"hover:bg-slate-400 even:bg-gray-100 odd:bg-white"}>
                        {row.getVisibleCells().map((cell) => flexRender(cell.column.columnDef.cell, cell.getContext()))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}