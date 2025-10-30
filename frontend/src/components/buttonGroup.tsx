import type { PropsWithChildren } from "react";

type ButtonGroupProps = PropsWithChildren;
export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <div className={"flex flex-wrap gap-2ch justify-start items-center"}>
      {props.children}
    </div>
  );
}
