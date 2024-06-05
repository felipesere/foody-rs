import classnames from "classnames";

type FieldsetProps = {
  legend: string;
  children?: React.ReactNode;
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
      <legend className={classnames(props.className?.legend, "px-2")}>
        {props.legend}
      </legend>
      {props.children}
    </fieldset>
  );
}
