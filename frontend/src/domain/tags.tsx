import type { Ingredient } from "../apis/shoppinglists.ts";
import type { Tag } from "../apis/tags.ts";

export function lowestOrderedTag(
  candidateTags: string[],
  knownTags: Record<string, Tag>,
): string | undefined {
  let v: [number, string] | undefined = undefined;

  for (const candidateTag of candidateTags) {
    const details = knownTags[candidateTag];

    if (details.is_aisle) {
      if (v !== undefined) {
        v = v[0] > details.order ? [details.order, details.name] : v;
      } else {
        v = [details.order, details.name];
      }
    }
  }

  return v ? v[1] : undefined;
}
type Section = {
  name: string;
  ingredients: Ingredient[];
};

export function orderByTags(
  ingredients: Ingredient[],
  knownTags: Record<string, Tag>,
): Section[] {
  const ingredientSections: Section[] = Object.values(knownTags).map((t) => ({
    name: t.name,
    ingredients: [],
  }));
  const untagged: Section = {
    name: "untagged",
    ingredients: [],
  };

  for (const i of ingredients) {
    const tag = lowestOrderedTag(i.tags, knownTags);
    if (tag) {
      const section = ingredientSections.find((s) => s.name === tag);
      if (section) {
        section.ingredients.push(i);
      }
    } else {
      untagged.ingredients.push(i);
    }
  }

  ingredientSections.push(untagged);

  return ingredientSections.filter((s) => s.ingredients.length > 0);
}
