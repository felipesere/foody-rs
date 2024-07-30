import classnames from "classnames";

export type PillProps = {
  value: string;
  onClose?: () => void;
};
export function Pill(props: PillProps) {
  return (
    <div
      className={classnames(
        "flex flex-row items-center border-solid border-black border-2",
        {
          "pr-2": props.onClose,
          "px-2": !props.onClose,
        },
      )}
    >
      {props.onClose && (
        <span
          className={"hover:bg-gray-300 px-2 cursor-pointer mr-2 max"}
          onClick={props.onClose}
        >
          &#x2715;
        </span>
      )}
      <p>{props.value}</p>
    </div>
  );
}
