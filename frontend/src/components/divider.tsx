type DividerProps = {
  label?: string;
  className?: string;
};

export function Divider(props: DividerProps) {
  if (props.label) {
    return (
      <div className={"flex flex-row items-center h-1lh"}>
        <hr className="h-[2px] w-6ch bg-black border-0 mr-1ch" />
        <span className={props.className}>{props.label}</span>
        <hr className="h-[2px] w-full bg-black border-0 ml-1ch" />
      </div>
    );
  }
  return (
    <div className="flex items-center h-1lh">
      <hr className="h-[2px] w-full bg-black border-0" />
    </div>
  );
}
