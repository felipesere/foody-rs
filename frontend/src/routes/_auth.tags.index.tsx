import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GraphQLClient, gql } from "graphql-request";

interface IngredientTagsQuery {
  allTags: Array<{
    name: string;
    id: number;
    tags: string[];
  }>;
}

const ingredientTagsDocument = gql`
    query IngredientTags {
        allTags(tagged: "felipe") {
            name,
            id,
            tags
        }
    }
`;

export const Route = createFileRoute("/_auth/tags/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery<IngredientTagsQuery>({
    queryKey: ["gqp", "ingredient", "tags"],
    queryFn: async () => {
      let endpoint = "http://localhost:5150/api/gql";
      const client = new GraphQLClient(endpoint, {
        credentials: "include",
        mode: "cors",
      });
      return client.request(ingredientTagsDocument, {});
    },
  });

  return (
    <div className="content-grid space-y-4">
      <p>Hello tags!</p>
      <ul>{data && data.allTags.map((tag) => <p>{tag.name}</p>)}</ul>
    </div>
  );
}
