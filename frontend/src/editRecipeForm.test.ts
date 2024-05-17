import { expect, test } from "vitest";
import { parseEditFormData } from "./editRecipeForm.ts";

test("extract data from form", () => {
  const f = new FormData();
  f.append("name", "Tartiflette");
  f.append("source", "book");
  f.append("bookTitle", "Simplissime");
  f.append("bookPage", "132");
  f.append("ingredient[6]", "6x");
  f.append("ingredient[9]", "400g");
  f.append("ingredient[1]", "a handful");
  f.append("ingredient[876]", "200ml");

  const actual = parseEditFormData(f);

  const recipe = {
    name: "Tartiflette",
    source: {
      kind: "book",
      title: "Simplissime",
      page: 132,
    },
    ingredients: [
      { id: "6", quantity: "6x" },
      { id: "9", quantity: "400g" },
      { id: "1", quantity: "a handful" },
      { id: "876", quantity: "200ml" },
    ],
  };

  expect(actual).toEqual(recipe);
});
