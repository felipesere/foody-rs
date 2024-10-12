import type { PropsWithChildren } from "react";

type ButtonGroupProps = PropsWithChildren;
export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <div className={"flex flex-wrap gap-2 justify-start items-center"}>
      {props.children}
    </div>
  );
}
