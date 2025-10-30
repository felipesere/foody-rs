type DividerProps = {
  label?: string;
  className?: string;
};

export function Divider(props: DividerProps) {
  if (props.label) {
    return (
      <div className={"flex flex-row"}>
        <hr className="h-0.5 my-1lh w-6ch bg-black border-0 mr-2ch translate-y-1" />
        <span className={props.className}>{props.label}</span>
        <hr className="h-0.5 my-1lh w-full bg-black border-0 ml-2ch translate-y-1" />
      </div>
    );
  }
  return <hr className="h-0.5 my-1lh w-full bg-black border-0" />;
}
