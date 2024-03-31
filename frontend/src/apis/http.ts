import ky from "ky";

const prefixUrl =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "";
export const http = ky.create({
  prefixUrl,
});
