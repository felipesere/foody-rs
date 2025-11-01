import classnames from "classnames";
import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<never> & {
  label: string;
  classNames?: Record<string, boolean> | string;
};

export function Button(props: ButtonProps) {
  const { className, classNames, label, ...restProps } = props;

  return (
    <button
      {...restProps}
      className={classnames(
        className,
        classNames,
        "px-1ch text-black bg-gray-300 shadow",
      )}
    >
      {label}
    </button>
  );
}
