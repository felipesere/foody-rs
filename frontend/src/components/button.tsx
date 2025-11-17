import classnames from "classnames";
import { type ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<never> & {
  label: string;
  classNames?: Record<string, boolean> | string;
  shadow?: boolean;
};

export function Button(props: ButtonProps) {
  const { className, classNames, label, shadow, ...restProps } = props;

  const useShadow = shadow ?? true;

  return (
    <button
      {...restProps}
      className={classnames(
        className,
        classNames,
        "px-1ch min-h-1lh text-black bg-gray-300",
        {
          shadow: useShadow,
        },
      )}
    >
      {label}
    </button>
  );
}
