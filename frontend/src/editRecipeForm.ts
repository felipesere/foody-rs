import type { Ingredient, Recipe, Source } from "./apis/recipes.ts";

export type EditRecipeForm = Omit<Recipe, "ingredients"> & {
  ingredients: { quantity: string; id: Ingredient["id"] }[];
};

export type Error = {
  message: string;
};

export function isError<T>(val: Error | T): val is Error {
  return (val as Error).message !== undefined;
}

export function parseEditFormData(f: FormData): EditRecipeForm | Error {
  const ingredientIdAndQuantity = /ingredient\[(\d+)\]/;

  const rawId = f.get("id")?.toString();
  if (!rawId) {
    return { message: "id missing" };
  }
  const id = Number(rawId);

  const name = f.get("name")?.toString();
  if (!name) {
    return { message: "name missing" };
  }

  const source = f.get("source")?.toString();
  if (!source) {
    return { message: "'source' missing" };
  }

  let sourceDetails: Source | undefined;
  if (source === "book") {
    const page = f.get("bookPage");
    const title = f.get("bookTitle");
    if (page && title) {
      sourceDetails = {
        source: "book",
        title: title.toString(),
        page: Number(page.toString()),
      };
    } else {
      return { message: "page and title" };
    }
  } else if (source === "website") {
    const url = f.get("url");
    if (url) {
      sourceDetails = {
        source: "website",
        url: url.toString(),
      };
    } else {
      return { message: "url missing" };
    }
  }

  if (!sourceDetails) {
    return { message: "details for selected source missing" };
  }

  const ingredients: EditRecipeForm["ingredients"] = [];
  for (const [key, value] of f.entries()) {
    const quantityMatches = ingredientIdAndQuantity[Symbol.match](key);
    if (quantityMatches) {
      const id = Number(quantityMatches[1]);
      if (ingredients.find((i) => i.id === id)) {
        // skip dupes, if there are any...
        continue;
      }
      ingredients.push({
        id,
        quantity: value.toString(),
      });
    }
  }
  return {
    id,
    name,
    ...sourceDetails,
    ingredients,
  };
}
