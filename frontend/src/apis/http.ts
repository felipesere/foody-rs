import { GraphQLClient } from "graphql-request";
import ky from "ky";

const prefixUrl =
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? "http://localhost:5150"
    : "/";
export const http = ky.create({
  prefixUrl,
});

const gqlPrefixUrl =
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? "http://localhost:5150"
    : "https://foody.felipesere.com";

export const graphql = new GraphQLClient(`${gqlPrefixUrl}/api/gql`, {
  credentials: "include",
  mode: "cors",
});
