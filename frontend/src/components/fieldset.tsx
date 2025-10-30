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
        "border-black border-2 px-2ch py-1lh flex flex-row gap-4ch",
      )}
    >
      {props.legend && (
        <legend className={classnames(props.className?.legend, "px-2ch")}>
          {props.legend}
        </legend>
      )}
      {props.children}
    </fieldset>
  );
}
