import { useMergeRefs } from "@floating-ui/react";
import type { ReferenceType } from "@floating-ui/react-dom";
import classnames from "classnames";
import {
  type ButtonHTMLAttributes,
  type ForwardedRef,
  forwardRef,
  useRef,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";

type ButtonProps<RT extends ReferenceType = ReferenceType> =
  ButtonHTMLAttributes<never> & {
    label: string;
    hotkey?: string;
    classNames?: Record<string, boolean> | string;
    setRef?: (node: RT | null) => void;
  };

export function Button(props: ButtonProps) {
  const refToButton = useRef<HTMLButtonElement>(null);
  const r = useMergeRefs([refToButton, props.setRef]);

  useHotkeys(
    props.hotkey || "",
    () => {
      refToButton.current?.click();
    },
    [props.hotkey],
    {
      enabled: Boolean(props.hotkey),
    },
  );

  return <ButtonWithRef {...props} ref={r} />;
}

const ButtonWithRef = forwardRef(InnerButton) as (
  props: ButtonProps & { ref?: ForwardedRef<HTMLButtonElement> },
) => ReturnType<typeof InnerButton>;

function InnerButton(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const { className, classNames, label, setRef, ...restProps } = props;

  return (
    <button
      {...restProps}
      ref={ref}
      className={classnames(
        className,
        classNames,
        "px-2 text-black bg-gray-300 shadow",
      )}
    >
      {labelWithHotkeyhighlight(label, props.hotkey)}
    </button>
  );
}

function labelWithHotkeyhighlight(
  label: ButtonProps["label"],
  hotkey: ButtonProps["hotkey"],
) {
  if (!hotkey) {
    return <>{label}</>;
  }

  const actualKey = hotkey.replace(/^[^+]*\+?/, "");

  const lowerLabel = label.toLowerCase();
  const point = lowerLabel.indexOf(actualKey);

  const before = label.slice(0, point);
  const character = label.slice(point, point + 1);
  const after = label.slice(point + 1);

  return (
    <>
      {before}
      <span className={"font-bold"}>{character}</span>
      {after}
    </>
  );
}
