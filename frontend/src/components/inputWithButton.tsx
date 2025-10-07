import { useRef } from "react";
import { Button } from "./button.tsx";

interface Props {
  label: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
}

export function InputWithButton(props: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={"flex flex-row"}>
      <input
        ref={ref}
        className={
          " bg-white border-black border-solid border-y-2 border-l-2 px-2"
        }
        type={"text"}
        placeholder={props.placeholder}
      />
      <Button
        label={props.label}
        onClick={() => {
          if (ref.current) {
            props.onSubmit(ref.current.value);
          }
        }}
      />
    </div>
  );
}
