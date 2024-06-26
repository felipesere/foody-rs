import ky from "ky";

const prefixUrl =
  import.meta.env.MODE === "development" || import.meta.env.MODE === "test"
    ? "http://localhost:3000"
    : "/";
export const http = ky.create({
  prefixUrl,
});
