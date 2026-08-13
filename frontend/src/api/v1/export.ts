import { useMutation } from "@tanstack/react-query";
import { http } from "./index.ts";

/** Name the dump after the day it was taken, so several exports don't collide
 * in the browser's downloads folder. */
export function exportFilename(now = new Date()) {
  return `foody-export-${now.toISOString().slice(0, 10)}.json`;
}

/** Fetches the group's full data dump as a blob. It goes through ky rather than
 * pointing a link straight at the endpoint so the request carries the session
 * cookie in dev (where the API is on another origin) and a failure surfaces as
 * a rejected promise instead of the browser navigating to an error page.
 *
 * The body is deliberately not parsed: it is the same JSON the import endpoint
 * reads back, and the app only ever passes it through to disk. */
export function useExport() {
  return useMutation({
    mutationFn: () => http.get("api/v1/export").blob(),
  });
}
