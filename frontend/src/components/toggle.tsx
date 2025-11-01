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
    <div className={"px-1ch py-1lh border-black border-solid border-2"}>
      <div
        className={classNames("flex flex-row items-center", {
          "pb-1lh": open,
        })}
      >
        <ToggleButton onToggle={() => setOpen((v) => !v)} open={open} />
        <button
          className={"px-1ch border-0"}
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
      className={classnames("mx-1ch transition-transform ease-linear", {
        "rotate-90": props.open,
      })}
      style={{ maxHeight: "24px", verticalAlign: "text-top" }}
    >
      {TOGGLE_MENU}
    </div>
  );
}
