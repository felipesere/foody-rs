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
  const arbitrary: Array<Quantity> = [];
  for (const quantity of quantities) {
    if (quantity.unit === "arbitrary") {
      arbitrary.push(quantity);
    } else {
      const qs = byUnit[quantity.unit] || [];
      qs.push(quantity);
      byUnit[quantity.unit] = qs;
    }
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

  const allArbitraryOnes = arbitrary.map((q) => q.text) as string[];

  return elements.concat(allArbitraryOnes).join(" & ");
}

export function parse(raw: string): Quantity {
  const matches =
    / *(?<numerator>\d+\.?\d*) *\/? *(?<denominator>\d+\.?\d*)? *(?<unit>[^ ]+)?/.exec(
      raw,
    );
  if (!matches?.groups) {
    return {
      unit: "arbitrary",
      text: raw,
    };
  }
  const groups = matches.groups;
  const numerator = Number(groups.numerator);

  const denominator: number = Number(groups.denominator || "1");
  const unit = groups.unit;

  const value = numerator / denominator;
  if (!unit || unit === "x") {
    return {
      value,
      unit: "count",
    };
  }

  return {
    value,
    unit: canonical(unit),
  };
}

function canonical(unit: string): string {
  return invertedUnit[unit] || unit;
}

function invert(input: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(input).map(([k, v]) => [v, k]));
}

const unitConversion: Record<string, string> = {
  gram: "g",
  grams: "g",
  kilogram: "kg",
  kilograms: "kg",
  millilitre: "ml",
  litre: "l",
  liter: "l",
  tablespoon: " tbsp",
  teaspoon: " tsp",
  cup: " cup",
  count: "x",
};

const invertedUnit = invert(unitConversion);
