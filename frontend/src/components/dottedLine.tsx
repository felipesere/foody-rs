import classnames from "classnames";

export function DottedLine(props: { className?: string }) {
  return (
    <div
      className={classnames(
        props.className,
        "flex-auto mx-1ch bg-repeat-x dotted-line h-[1em] mb-[0.15em]",
      )}
    />
  );
}
