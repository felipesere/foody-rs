import classnames from "classnames";
import { type PropsWithChildren } from "react";
import { Popup } from "./popup.tsx";

interface KebabMenuProps {}
export function KebabMenu(props: PropsWithChildren<KebabMenuProps>) {
  return (
    <Popup>
      <Popup.OpenButton
        label={"≡"}
        className={"bg-transparent borderless font-extrabold hover:bg-gray-300"}
        type={"submit"}
        shadow={false}
      />
      <Popup.Pane>{props.children}</Popup.Pane>
    </Popup>
  );
}

type style = "plain" | "dark";

interface ButtonProps {
  value: string;
  onClick: () => void;
  style?: style;
  className?: string;
}
export function Button({ onClick, value, className, style }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type="submit"
      className={classnames("px-2ch", className, {
        "text-white bg-gray-700": style === "dark",
      })}
    >
      {value}
    </button>
  );
}

export function Divider() {
  return <hr className="h-0.5 my-0.5lh w-full bg-black border-0" />;
}
KebabMenu.Button = Button;
KebabMenu.Divider = Divider;
