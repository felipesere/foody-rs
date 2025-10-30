import classnames from "classnames";

export type PillProps = {
  value: string;
  onClose?: (v: string) => void;
};
export function Pill(props: PillProps) {
  return (
    <div
      className={classnames(
        "flex flex-row items-center border-solid border-black border-2",
        {
          "pr-2ch": props.onClose,
          "px-2ch": !props.onClose,
        },
      )}
    >
      {props.onClose && (
        <span
          className={"hover:bg-gray-300 px-2ch cursor-pointer mr-2ch max"}
          onClick={() => props.onClose?.(props.value)}
        >
          &#x2715;
        </span>
      )}
      <p>{props.value}</p>
    </div>
  );
}
