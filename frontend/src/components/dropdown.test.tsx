import "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Dropdown } from "./dropdown.tsx";

const items = [
  { name: "Alpha" },
  { name: "Bravo" },
  { name: "Charlie" },
  { name: "Delta" },
];

test("clicking on an existing item", async () => {
  let selected = undefined;
  let newItem = undefined;
  render(
    <Dropdown
      items={items}
      onSelectedItem={(item) => {
        selected = item;
      }}
      onNewItem={(item) => {
        newItem = item;
      }}
      placeholder={"Greek letters"}
    />,
  );

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const i = await screen.findByPlaceholderText("Greek letters")!;
  await userEvent.type(i, "Char", {});
  await userEvent.click(await screen.findByText("Charlie"));

  expect(selected).toBeDefined();
  expect(newItem).toBeUndefined();
});

test("clicking on a new item", async () => {
  let selected = undefined;
  let newItem = undefined;
  render(
    <Dropdown
      items={items}
      onSelectedItem={(item) => {
        selected = item;
      }}
      onNewItem={(item) => {
        newItem = item;
      }}
      placeholder={"Greek letters"}
    />,
  );

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const i = await screen.findByPlaceholderText("Greek letters")!;
  await userEvent.type(i, "Epsilon", {});
  await userEvent.click(await screen.findByText("Epsilon"));

  expect(selected).toBeUndefined();
  expect(newItem).toBeDefined();
});
