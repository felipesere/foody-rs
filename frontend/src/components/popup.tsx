import { useId } from "@floating-ui/react";
import classNames from "classnames";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { Button as InnerButton } from "./button";

export const PopupContext = createContext({
  targetId: "",
  hidePopover: () => {},
});

export function Popup(props: PropsWithChildren<{}>) {
  const id = useId()!;
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  // do I need to worry about useMemo and stuff?
  const hidePopover = () => {
    if (popoverElementRef.current) {
      popoverElementRef.current.hidePopover();
    }
  };
  return (
    <PopupContext.Provider value={{ targetId: id, hidePopover }}>
      <div className={"new-single-select-pane"}>{props.children}</div>;
    </PopupContext.Provider>
  );
}

interface ButtonProps {
  label: string;
  className?: string;
}
function Button(props: ButtonProps) {
  const { targetId } = useContext(PopupContext);

  return (
    <InnerButton
      popoverTarget={targetId}
      label={props.label}
      className={classNames(props.className, "new-single-select-button")}
      type={"button"}
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
      type={"button"}
    />
  );
}

/*
function OtherButton(props: ButtonProps) {
  const { hidePopover } = useContext(PopupContext);

  return (
    <InnerButton
      label={props.label}
      className={props.className}
      type={"button"}
      onClick={() => hidePopover()}
    />
  );
}
*/

interface PaneProps {}
function Pane(props: PropsWithChildren<PaneProps>) {
  const { targetId } = useContext(PopupContext);
  return (
    <div
      id={targetId}
      popover={"auto"}
      tabIndex={-1}
      className={
        "bg-gray-100 p-2 border-solid border-black border-2 z-50 new-single-select"
      }
    >
      {props.children}
    </div>
  );
}

Popup.Button = Button;
Popup.CloseButton = CloseButton;
Popup.Pane = Pane;

/*
function NewSingleSelect() {
  return (
    <Popup>
      <Button label={"something"} />
      <Pane>
        <p>Some Big Thing...</p>
        <Divider />
        <div className={"space-y-2"}>
          <InputWithButton
            label={"+"}
            placeholder={"New aisle..."}
            onSubmit={() => {}}
          />
          <ButtonGroup>
            <CloseButton label="Save" />
            <InnerButton
              label={"Reset"}
              hotkey={"ctrl+r"}
              type="button"
              onClick={() => {}}
            />
          </ButtonGroup>
        </div>
      </Pane>
    </Popup>
  );
}
 */
