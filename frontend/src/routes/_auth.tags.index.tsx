import {createFileRoute} from "@tanstack/react-router";
import {KebabMenu} from "../components/kebabMenu.tsx";
import {graphql} from "../gql";
import {IngredientTagsQuery} from "../gql/graphql.ts";
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable} from "@tanstack/react-table";
import {Ingredient, useAllIngredients} from "../apis/ingredients.ts";
import {useMemo, useState} from "react";

export const Route = createFileRoute("/_auth/tags/")({
    component: RouteComponent,
});

function RouteComponent() {
    const {token} = Route.useRouteContext();

    let ingredients = useAllIngredients(token)

    if (
        !ingredients.data ||
        ingredients.isLoading
    ) {
        return <p>Loading</p>;
    }

    let tags = ingredients.data.flatMap((i) => i.tags).sort().filter((x, i, a) => a.indexOf(x) == i);

    return (
        <div className="content-grid space-y-4">
            <TagsTable ingredients={ingredients.data} knownTags={tags}/>
        </div>
    );
}


function TagsTable(props: {
    ingredients: Ingredient[],
    knownTags: string[],
}) {

    const [batchEdit, setBatchEdit] = useState(false);
    const knownTags = props.knownTags;
    const helper = createColumnHelper<Ingredient>()

    const columns = useMemo(() => [
        helper.accessor("name", {
            header: "Name",
            cell: cell => <td className={"p-2"}>{cell.row.original.name}</td>
        }),
        helper.accessor("tags", {
            header: "Tags",
            cell: cell => {
                let batchTags = knownTags.map(t => {
                    const color = cell.row.original.tags.includes(t) ? `text-black` : `text-gray-400`;
                    return (<span className={`bg-white border-2 px-2 mr-2 ${color}`}>{t}</span>)
                })
                let ownTags = cell.row.original.tags.map((t) => {
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
            <button onClick={() => setBatchEdit((v) => !v)}>Toggle Batch Edit</button>
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