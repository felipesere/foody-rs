import classnames from "classnames";

export function DottedLine(props: {className?: string}) {
  return <div className={classnames(props.className, "flex-auto mx-0.5 bg-repeat-x dotted-line")} />
}
