import {useQuery} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";
import {graphql} from "../gql";
import {graphql as client} from "../apis/http.ts";
import {IngredientTagsQuery, TagsQuery} from "../gql/graphql.ts";
import {KebabMenu} from "../components/kebabMenu.tsx";

const IngredientTagsDocument = graphql(`
    query ingredientTags {
        allTags(tagged: "ingredient") {
            name,
            id,
            tags
        }
    }
`);

const TagsDocument = graphql(`
    query tags {
       tags
   }
`)

export const Route = createFileRoute("/_auth/tags/")({
    component: RouteComponent,
});

function RouteComponent() {
    const ingredients = useQuery({
        queryKey: ["gqp", "ingredient", "tags"],
        queryFn: async () => {
            return client.request(IngredientTagsDocument, {});
        },
    });

    const tags = useQuery(({
        queryKey: ["gqp", "tags"],
        queryFn: async () => {
            return client.request(TagsDocument, {});
        },
    }))

    if (!ingredients.data || !tags.data || ingredients.isLoading || tags.isLoading) {
        return (<p>Loading</p>)
    }

    let ts = tags.data.tags;
    ts.sort();

    return (
        <div className="content-grid space-y-4">
            <TagsTable knownTags={ts} ingredients={ingredients.data.allTags} />
        </div>
    );
}

function TagsTable(props: { knownTags: TagsQuery["tags"], ingredients: IngredientTagsQuery["allTags"] }) {
    return (
        <table className={"border-spacing-2 border-collapse text-left"}>
            <thead>
            <tr>
                <th className={"p-2"}>Name</th>
                <th className={"p-2"}>Tags</th>
                <th className={"p-2"}></th>
            </tr>
            </thead>
            <tbody>
            {props.ingredients.map((ingredient) => (
                <TagTableRow knownTags={props.knownTags} ingredient={ingredient}/>))}
            </tbody>
        </table>
    )
}
function TagTableRow(props: { knownTags: string[], ingredient: IngredientTagsQuery["allTags"][0] }) {
    let tags = props.ingredient.tags;
    tags.sort();
    return (
        <tr className={"hover:bg-gray-200 even:bg-gray-100 odd:bg-white"}>
            <td className={"p-2"}>{props.ingredient.name}</td>
            <td className={"p-2 flex flex-row gap-2 flex-wrap"}>
                {tags.map((tag) => {
                    return (<span className={`bg-white border-2 px-2 mr-2`}>{tag}</span>);
                })}
            </td>
            <td className={"p-2"}>
                <KebabMenu>
                    <p>Something...</p>
                </KebabMenu>
            </td>
        </tr>
    )
}
