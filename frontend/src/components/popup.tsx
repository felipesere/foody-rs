import classNames from "classnames";
import {
  createContext,
  MouseEventHandler,
  PropsWithChildren,
  useContext,
  useId,
  useRef,
} from "react";
import { Button as InnerButton } from "./button";

export const PopupContext = createContext({
  targetId: "",
  hidePopover: () => {},
});

export function Popup(props: PropsWithChildren<{}>) {
  const id = useId();
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  // do I need to worry about useMemo and stuff?
  const hidePopover = () => {
    if (popoverElementRef.current) {
      popoverElementRef.current.hidePopover();
    }
  };
  return (
    <PopupContext.Provider value={{ targetId: id, hidePopover }}>
      <div className={"new-single-select-pane"}>{props.children}</div>
    </PopupContext.Provider>
  );
}

interface ButtonProps {
  label: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  type?: "button" | "submit" | "reset";
}

function OpenButton(props: ButtonProps) {
  const { targetId } = useContext(PopupContext);

  return (
    <InnerButton
      popoverTarget={targetId}
      label={props.label}
      className={classNames(props.className, "new-single-select-button")}
      type={props.type || "button"}
      onClick={(ev) => {
        props.onClick?.(ev);
      }}
    />
  );
}

function CloseButton(props: ButtonProps) {
  const { targetId } = useContext(PopupContext);

  return (
    <InnerButton
      popoverTarget={targetId}
      popoverTargetAction={"hide"}
      label={props.label}
      className={props.className}
      type={props.type || "button"}
      onClick={(event) => {
        props.onClick?.(event);
      }}
    />
  );
}

interface PaneProps {
  className?: string;
}
function Pane(props: PropsWithChildren<PaneProps>) {
  const { targetId } = useContext(PopupContext);
  return (
    <div
      id={targetId}
      popover={"auto"}
      tabIndex={-1}
      className={classNames(
        "bg-gray-100 px-2ch py-1lh border-solid border-black border-2 z-50 new-single-select",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

Popup.OpenButton = OpenButton;
Popup.CloseButton = CloseButton;
Popup.Pane = Pane;
