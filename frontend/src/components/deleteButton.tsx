import classnames from "classnames";

export function DeleteButton(props: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <div
      className={classnames(props.className, "borderless hover:text-red-700 ")}
      onClick={props.onClick}
    >
      ⓧ
    </div>
  );
}
