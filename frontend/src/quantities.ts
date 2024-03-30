import type { Quantity } from "./apis/recipes.ts";

export function humanize(quantity: Quantity): string {
  if (quantity.text) {
    return quantity.text;
  }
  const unit = unitConversion[quantity.unit];
  return `${quantity.value}${unit}`;
}

export function combineQuantities(quantities: Quantity[]): string {
  const byUnit: Record<string, Quantity[]> = {};
  for (const quantity of quantities) {
    const qs = byUnit[quantity.unit] || [];
    qs.push(quantity);
    byUnit[quantity.unit] = qs;
  }

  const elements = [];
  for (const [unit, quantities] of Object.entries(byUnit)) {
    const totalValue = quantities.reduce(
      (total, q) => total + (q.value || 0),
      0,
    );

    const unitSymbol = unitConversion[unit] || unit;
    elements.push(`${totalValue}${unitSymbol}`);
  }
  // re-consider arbitrary later
  // const arbitrary = (byUnit.arbitrary || []).map((q) => q.text);

  // return elements.concat(arbitrary).join(" & ");
  return elements.join(" & ");
}

const unitConversion: Record<string, string> = {
  gram: "g",
  grams: "g",
  kilogram: "kg",
  millilitre: "ml",
  litre: "l",
  liter: "l",
  tablespoon: " tbsp",
  teaspoon: " tsp",
  cup: " cup",
  count: "x",
};
