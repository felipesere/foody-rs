import ky from "ky";
import {GraphQLClient} from "graphql-request";

const prefixUrl =
    import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
        ? "http://localhost:5150"
        : "/";
export const http = ky.create({
    prefixUrl,
});

export const graphql = new GraphQLClient(`${prefixUrl}/api/gql`, {
    credentials: "include",
    mode: "cors",
})