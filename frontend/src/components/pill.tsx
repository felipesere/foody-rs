import classnames from "classnames";

export type PillProps = {
  value: string;
  onClose?: (v: string) => void;
};
export function Pill(props: PillProps) {
  return (
    <div
      className={classnames(
        "flex flex-row items-center gap-x-1ch px-1ch border-solid border-black border-2 h-fit",
      )}
    >
      {props.onClose && (
        <span
          className={"hover:bg-gray-300 cursor-pointer min-h-1lh"}
          onClick={() => props.onClose?.(props.value)}
        >
          &#x2715;
        </span>
      )}
      <p className="leading-none my-0">{props.value}</p>
    </div>
  );
}
