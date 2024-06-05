type DividerProps = {
  label?: string;
};

export function Divider(props: DividerProps) {
  if (props.label) {
    return (
      <div className={"flex flex-row"}>
        <hr className="h-0.5 my-2 w-6 bg-black border-0 mr-2 translate-y-1" />
        {props.label}
        <hr className="h-0.5 my-2 w-full bg-black border-0 ml-2 translate-y-1" />
      </div>
    );
  }
  return <hr className="h-0.5 my-2 w-full bg-black border-0" />;
}
