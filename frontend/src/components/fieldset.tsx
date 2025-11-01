import classnames from "classnames";
import type { ReactNode } from "react";

type FieldsetProps = {
  legend?: string;
  children: ReactNode;
  className?: {
    fieldSet?: string;
    legend?: string;
  };
};

export function FieldSet(props: FieldsetProps) {
  return (
    <fieldset
      className={classnames(
        props.className?.fieldSet,
        "border-black border-2 px-1ch py-0.5lh flex flex-row gap-2ch",
      )}
    >
      {props.legend && (
        <legend className={props.className?.legend}>{props.legend}</legend>
      )}
      {props.children}
    </fieldset>
  );
}
