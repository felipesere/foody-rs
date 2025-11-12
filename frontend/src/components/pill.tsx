import classnames from "classnames";

export type PillProps = {
  value: string;
  onClose?: (v: string) => void;
};
export function Pill(props: PillProps) {
  return (
    <div
      className={classnames(
        "flex flex-row gap-x-1ch px-1ch border-solid border-black border-2",
      )}
    >
      {props.onClose && (
        <span
          className={"hover:bg-gray-300 cursor-pointer"}
          onClick={() => props.onClose?.(props.value)}
        >
          &#x2715;
        </span>
      )}
      <p>{props.value}</p>
    </div>
  );
}
