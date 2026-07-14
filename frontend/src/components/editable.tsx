import classnames from "classnames";

/**
 * Click-to-edit text: a plain `<p>` when read-only, a native `<input>` when
 * `isEditing`. The input is uncontrolled (seeded from `value`) so it owns its
 * own draft while editing — remounting when edit mode toggles is what discards
 * a cancelled edit. `onBlur` reports the committed value; Enter commits by
 * blurring.
 */
export function Editable(props: {
  isEditing: boolean;
  value: string;
  onBlur: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  if (!props.isEditing) {
    return (
      <p className={classnames("min-w-4", props.className)}>{props.value}</p>
    );
  }

  return (
    <input
      type="text"
      className={classnames(
        "min-w-4 bg-white px-1ch outline-dashed outline-2 outline-yellow-400",
        props.className,
      )}
      defaultValue={props.value}
      placeholder={props.placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.blur();
        }
      }}
      onBlur={(e) => props.onBlur(e.target.value.trim())}
    />
  );
}
