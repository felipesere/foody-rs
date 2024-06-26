import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/dom";
import {
  type RenderOptions,
  act,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactElement } from "react";
import { expect, test } from "vitest";
import type { Recipe } from "../apis/recipes.ts";
import { parse } from "../quantities.ts";
import { EditRecipeFrom } from "./editRecipeFrom.tsx";

const queryClient = new QueryClient();

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

const handlers = [
  http.get("http://localhost:3000/api/ingredients", () => {
    return HttpResponse.json([
      {
        id: 1,
        name: "apples",
        tags: ["fruit"],
      },
      {
        id: 2,
        name: "carrots",
        tags: ["vegetable"],
      },
    ]);
  }),
];

test("doing something with the form", async () => {
  const server = setupServer(...handlers);
  server.events.on("request:start", ({ request }) => {
    console.log("Outgoing:", request.method, request.url);
  });
  server.listen({ onUnhandledRequest: "error" });

  const tartiflette: Recipe = {
    name: "Tartiflette",
    id: 123,
    ingredients: [
      {
        id: 1,
        name: "potato",
        quantity: [{ id: 1, ...parse("100g") }],
      },
      {
        id: 2,
        name: "cream",
        quantity: [{ id: 2, ...parse("2x") }],
      },
    ],
    page: 123,
    source: "book",
    title: "Simplissime",
  };
  customRender(<EditRecipeFrom token={"123"} recipe={tartiflette} />);
  await act(async () => {});

  const ingredientSearch = await screen.findByPlaceholderText("ingredients...");
  await userEvent.type(ingredientSearch, "carr");
  await act(async () => {});

  // biome-ignore lint/style/noNonNullAssertion: We are in a test scenario and know that text exists
  const carrotsInDropdown = (await screen.findAllByText("carrots")).find(
    (e) => e.ariaSelected,
  )!;
  await userEvent.click(carrotsInDropdown);

  const quantity = await screen.findByTestId("new-quantity");
  await userEvent.click(quantity);
  await userEvent.type(quantity, "300g");

  const add = await screen.findByText("Add");
  await userEvent.click(add);

  const ingredients = (await screen.findAllByTestId("ingredient"))
    .map((i) => i.textContent!)
    .sort();

  //screen.debug();
  expect(ingredients).toEqual(["carrots", "cream", "potato"]);
});
