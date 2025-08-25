import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GraphQLClient } from "graphql-request";
import { graphql } from "../gql";

const IngredientTagsDocument = graphql(`
    query ingredientTags {
        allTags(tagged: "ingredient") {
            name,
            id,
            tags
        }
    }
`);

export const Route = createFileRoute("/_auth/tags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["gqp", "ingredient", "tags"],
    queryFn: async () => {
      let endpoint = "http://localhost:5150/api/gql";
      const client = new GraphQLClient(endpoint, {
        credentials: "include",
        mode: "cors",
      });
      return client.request(IngredientTagsDocument, {});
    },
  });

  return (
    <div className="content-grid space-y-4">
      <p>Hello tags!</p>
      <ul>{data && data.allTags.map((tag) => <p>{tag.name}</p>)}</ul>
    </div>
  );
}
