import classnames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useEditable } from "use-editable";

export function Editable(props: {
  isEditing: boolean;
  value: string;
  onBlur: (value: string) => void;
  className?: string;
}) {
  const [currentValue, setCurrentValue] = useState(props.value);
  const currentValueRef = useRef<HTMLParagraphElement | null>(null);

  useEditable(currentValueRef, setCurrentValue, { disabled: !props.isEditing });

  // TEMP: useEffect removed to test whether it causes the typing bug.

  return (
    <p
      className={classnames("min-w-4", props.className, {
        "outline-dashed outline-2 outline-yellow-400 whitespace-nowrap text-nowrap":
          props.isEditing,
      })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          currentValueRef.current?.blur();
        }
      }}
      onBlur={() => props.onBlur(currentValue.trim())}
      ref={currentValueRef}
    >
      {currentValue}
    </p>
  );
}
