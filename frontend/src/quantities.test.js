import { expect, test } from 'vitest'
import {combineQuantities, parse} from "./quantities";

test.each([
    {name: "count", v: "7", quantity: { unit: "count", value: 7}},
    {name: "count with x", v: "1x", quantity: { unit: "count", value: 1}},
    {name: "fraction", v: "3/2", quantity: { unit: "count", value: 1.5}},
    {name: "grams", v: "15g", quantity: { unit: "grams", value: 15}},
    {name: "kilograms", v: "1kg", quantity: { unit: "kilograms", value: 1}},
    {name: "liter", v: "1l", quantity: { unit: "liter", value: 1}},
    {name: "arbitrary stuff", v: "a small pinch", quantity: { unit: "arbitrary", text: "a small pinch"}},
])('$name', ({v, quantity}) => {
    expect(parse(v)).toEqual(quantity)
})


test("it combines quantities", () => {
    const a_pinch = parse("a pinch")
    const a_little_bit = parse("a little bit")

    expect(combineQuantities([a_pinch, a_little_bit])).toEqual("a pinch & a little bit")


})