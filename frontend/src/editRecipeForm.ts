export function parseEditFormData(f: FormData) {
  for (const [k, v] of f.entries()) {
    console.log(`${k} => ${v}`);
  }
  const recipe = {
    name: "",
    source: {} as
      | { kind: "book"; title: string; page: number }
      | { kind: "website"; url: string },
    ingredients: [] as { quantity: string; id: string }[],
  };
  const ingredientIdAndQuantity = /ingredient\[(\d+)\]/;

  const name = f.get("name");
  if (name) {
    recipe.name = name.toString();
  }

  const source = f.get("source");
  if (source) {
    if (source === "book") {
      const page = f.get("bookPage");
      const title = f.get("bookTitle");
      if (page && title) {
        recipe.source = {
          kind: "book",
          title: title.toString(),
          page: Number(page.toString()),
        };
      }
    }
    if (source === "website") {
      const url = f.get("url");
      if (url) {
        recipe.source = {
          kind: "website",
          url: url.toString(),
        };
      }
    }
  }

  for (const [key, value] of f.entries()) {
    const quantityMatches = ingredientIdAndQuantity[Symbol.match](key);
    if (quantityMatches) {
      recipe.ingredients.push({
        id: quantityMatches[1],
        quantity: value.toString(),
      });
    }
  }
  return recipe;
}
