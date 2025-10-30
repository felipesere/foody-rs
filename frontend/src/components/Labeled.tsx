import type { PropsWithChildren } from "react";

type LabeldProps = PropsWithChildren & {
  label: string;
  htmlFor: string;
};
export function Labeled(props: LabeldProps) {
  return (
    <div className={"flex flex-row gap"}>
      {props.children}
      <label className={"pl-2ch no-colon"} htmlFor={props.htmlFor}>
        {props.label}
      </label>
    </div>
  );
}
