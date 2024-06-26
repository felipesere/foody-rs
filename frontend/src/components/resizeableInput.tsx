import classnames from "classnames";
import classNames from "classnames";
import type { InputHTMLAttributes } from "react";

interface InputAutosizeProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  value: string;
  readOnly?: boolean;
  boxClassName?: string;
}

export function ResizingInput({
  className,
  value,
  name,
  boxClassName,
  readOnly,
  ...props
}: InputAutosizeProps) {
  return (
    <div className={classNames(boxClassName, "grid")}>
      {readOnly ? (
        <p className={className}>{value}</p>
      ) : (
        <>
          <span className="invisible" style={{ gridArea: " 1 / 1 " }}>
            {value
              ? value.replace(/ /g, "\u00A0").concat("\u00A0")
              : "\u00A0\u00A0\u00A0"}
          </span>
          <input
            autoComplete={"off"}
            size={1}
            style={{ gridArea: " 1 / 1 " }}
            type="text"
            value={value}
            className={classnames(
              className,
              "border-none bg-transparent outline-2 -outline-offset-2 outline-dashed outline-amber-400 focus:outline",
            )}
            name={name}
            {...props}
            onChange={props.onChange}
            onBlur={props.onBlur}
          />
        </>
      )}
    </div>
  );
}
