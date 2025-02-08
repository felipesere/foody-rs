import "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { expect, test } from "vitest";
import { Dropdown } from "./dropdown.tsx";

userEvent.setup();

const greekLetters = [
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
      items={greekLetters}
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
      items={greekLetters}
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

test("tabbing away after selecting an exisitng item with the keyboard", async () => {
  let selected = undefined;
  let newItem = undefined;
  let blurred = false;
  render(
    <Dropdown
      items={[
        { name: "Apple" },
        { name: "Charming" },
        { name: "Charmander" },
        { name: "Character" },
        { name: "Dragon" },
      ]}
      onSelectedItem={(item) => {
        selected = item;
      }}
      onNewItem={(item) => {
        newItem = item;
      }}
      onBlur={() => {
        blurred = true;
      }}
      placeholder={"Greek letters"}
    />,
  );

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  let input = await screen.findByPlaceholderText("Greek letters")!;
  await userEvent.type(input, "Char", {});
  await userEvent.keyboard("{ArrowDown}{ArrowDown}");
  await userEvent.keyboard("{tab}");

  expect(blurred).toBe(true);
  expect(selected).toEqual({ name: "Charmander" });
  expect(newItem).toBeUndefined();
});

test("tabbing away after selecting a new item with the keyboard", async () => {
  let selected = undefined;
  let newItem = undefined;
  let blurred = false;
  render(
    <Dropdown
      items={[{ name: "Apple" }]}
      onSelectedItem={(item) => {
        selected = item;
      }}
      onNewItem={(item) => {
        newItem = item;
      }}
      onBlur={() => {
        blurred = true;
      }}
      placeholder={"Greek letters"}
    />,
  );

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  let input = await screen.findByPlaceholderText("Greek letters")!;
  await userEvent.type(input, "Random", {});
  await userEvent.keyboard("{ArrowDown}");
  await userEvent.keyboard("{tab}");

  expect(blurred).toBe(true);
  expect(selected).toBeUndefined();
  expect(newItem).toEqual("Random");
});

test("loosing focus after using arrows to select and existing item", async () => {
  let selected = undefined;
  let newItem = undefined;
  let blurred = false;
  render(
    <div>
      <Dropdown
        items={greekLetters}
        onSelectedItem={(item) => {
          selected = item;
        }}
        onNewItem={(item) => {
          newItem = item;
        }}
        onBlur={() => {
          blurred = true;
        }}
        placeholder={"Greek letters"}
      />
      <a href={"#"}>Random focus target</a>
    </div>,
  );

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  let input = await screen.findByPlaceholderText("Greek letters")!;
  let focusTaget = screen.getByText("Random focus target");
  screen.debug();
  act(() => {
    userEvent.type(input, "Brav", {});
    userEvent.keyboard("{ArrowDown}");
    focusTaget.focus();
  });
  screen.debug();

  expect(blurred).toBe(true);
  expect(selected).toEqual({ name: "Bravo" });
  expect(newItem).toBeUndefined();
});
