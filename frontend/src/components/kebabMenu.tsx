import {
  FloatingFocusManager,
  autoUpdate,
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
        className={`hover:bg-gray-200 border-0 ${props.className}`}
        type={"submit"}
      >
        <svg
          viewBox="0 0 24 24"
          height="24px"
          width="25px"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Kebab Menu Dots</title>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
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
