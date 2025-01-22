import type { ShoppinglistItem } from "../apis/shoppinglists.ts";

export type Section = {
  name: string;
  items: ShoppinglistItem[];
};

export function orderByTags(items: ShoppinglistItem[]): Section[] {
  const tags = items
    .filter((item) => item.ingredient.tags.length > 0)
    .map((item) => item.ingredient.tags.sort()[0]);

  const ingredientSections: Section[] = tags.map((t) => ({
    name: t,
    items: [],
  }));
  const untagged: Section = {
    name: "untagged",
    items: [],
  };

  for (const item of items) {
    const tag = item.ingredient.tags[0];
    if (tag) {
      const section = ingredientSections.find((s) => s.name === tag);
      if (section) {
        section.items.push(item);
      }
    } else {
      untagged.items.push(item);
    }
  }

  ingredientSections.push(untagged);

  return ingredientSections.filter((s) => s.items.length > 0);
}
