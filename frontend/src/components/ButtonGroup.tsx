import type { PropsWithChildren } from "react";

type ButtonGroupProps = PropsWithChildren;
export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <div className={"flex flex-row gap-2 justify-start"}>{props.children}</div>
  );
}
