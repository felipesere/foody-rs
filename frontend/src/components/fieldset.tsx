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
        "border-black border-2 p-2 flex flex-row gap-4",
      )}
    >
      {props.legend && (
        <legend className={classnames(props.className?.legend, "px-2")}>
          {props.legend}
        </legend>
      )}
      {props.children}
    </fieldset>
  );
}
