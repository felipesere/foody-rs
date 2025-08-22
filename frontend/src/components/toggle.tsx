import classNames from "classnames";
import classnames from "classnames";
import type { PropsWithChildren } from "react";
import { useState } from "react";

const TOGGLE_MENU = "▶";

type Props = {
  buttonLabel: string;
};
type ToggleProps = PropsWithChildren<Props>;
export function Toggle(props: ToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"p-2 border-black border-solid border-2"}>
      <div
        className={classNames("flex flex-row", {
          "pb-2": open,
        })}
      >
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
        <button
          className={"px-2 border-0"}
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

type ToggleButtonProps = {
  onToggle: () => void;
  open: boolean;
};

export function ToggleButton(props: ToggleButtonProps) {
  return (
    <div
      onClick={props.onToggle}
      className={classnames("mx-2 transition-transform ease-linear", {
        "rotate-90": props.open,
      })}
    >
      {TOGGLE_MENU}
    </div>
  );
}
