import classNames from "classnames";
import { useState } from "react";
import type { PropsWithChildren } from "react";

const CLOSED_MENU = "▶";
const OPEN_MENU = "▼";

type Props = {
  buttonLabel: string;
};
type ToggleProps = PropsWithChildren<Props>;
export function Toggle(props: ToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"p-2 border-black border-solid border-2"}>
      <div
        className={classNames({
          "pb-2": open,
        })}
      >
        <span className={"mr-2"}>{open ? OPEN_MENU : CLOSED_MENU}</span>
        <button
          className={"px-2"}
          type={"button"}
          onClick={() => setOpen((v) => !v)}
        >
          {props.buttonLabel}
        </button>
      </div>
      {open && props.children}
    </div>
  );
}
