import { expect, test } from 'vitest'
import {combineQuantities, parse} from "./quantities";

test.each([
    {name: "count", v: "7", quantity: { unit: "count", value: 7, text: null}},
    {name: "count with x", v: "1x", quantity: { unit: "count", value: 1, text: null}},
    {name: "fraction", v: "3/2", quantity: { unit: "count", value: 1.5, text: null}},
    {name: "grams", v: "15g", quantity: { unit: "grams", value: 15, text: null}},
    {name: "kilograms", v: "1kg", quantity: { unit: "kilograms", value: 1, text: null}},
    {name: "liter", v: "1l", quantity: { unit: "liter", value: 1, text: null}},
    {name: "tablespoon", v: "1 tbsp", quantity: { unit: "tablespoon", value: 1, text: null}},
    {name: "tablespoon no space", v: "1tbsp", quantity: { unit: "tablespoon", value: 1, text: null}},
    {name: "teaspoon", v: "1 tsp", quantity: { unit: "teaspoon", value: 1, text: null}},
    {name: "teaspoon no space", v: "1tsp", quantity: { unit: "teaspoon", value: 1, text: null}},
    {name: "arbitrary stuff", v: "a small pinch", quantity: { unit: "arbitrary", text: "a small pinch", value: null}},
    {name: "number and arbitrary stuff", v: "1 something random", quantity: { unit: "arbitrary", text: "1 something random", value: null}},
])('$name', ({v, quantity}) => {
    expect(parse(v)).toEqual(quantity)
})


test("it combines quantities", () => {
    const a_pinch = parse("a pinch")
    const a_little_bit = parse("a little bit")

    expect(combineQuantities([a_pinch, a_little_bit])).toEqual("a pinch & a little bit")


})