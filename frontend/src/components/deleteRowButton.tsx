import classnames from "classnames";

export function DeleteRowButton(props: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type={"button"}
      className={classnames(props.className, "border-0")}
      onClick={props.onClick}
    >
      ⓧ
    </button>
  );
}
