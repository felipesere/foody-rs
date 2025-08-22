import {
  autoUpdate,
  FloatingFocusManager,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import classnames from "classnames";
import { type PropsWithChildren, useState } from "react";

interface KebabMenuProps {
  className?: string;
}
export function KebabMenu(props: PropsWithChildren<KebabMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(3), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`font-sans hover:bg-gray-200 border-0 ${props.className}`}
        type={"submit"}
      >
        ☰
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps({
              className:
                "z-30 shadow flex flex-col gap-2 bg-white p-2 border-solid border-black border-2",
            })}
          >
            {props.children}
          </div>
        </FloatingFocusManager>
      )}
    </>
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
      className={classnames("px-2", className, {
        "text-white bg-gray-700": style === "dark",
      })}
    >
      {value}
    </button>
  );
}

export function Divider() {
  return <hr className="h-0.5 my-0.5 w-full bg-black border-0" />;
}
KebabMenu.Button = Button;
KebabMenu.Divider = Divider;
