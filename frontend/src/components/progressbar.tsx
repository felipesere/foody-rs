import classnames from "classnames";

export function Progressbar({
  fraction,
  sticky,
}: {
  fraction: number;
  sticky?: boolean;
}) {
  return (
    <div
      className={classnames("px-2ch py-1lh bg-white z-30", {
        "sticky top-0 ": sticky,
      })}
    >
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-black transition-all duration-100 ease-in-out"
          style={{ width: `${fraction}%` }}
        />
      </div>
    </div>
  );
}
