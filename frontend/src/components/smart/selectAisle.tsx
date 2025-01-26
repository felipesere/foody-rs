import { useAllAisles } from "../../apis/aisles.ts";
import { SingleSelect } from "../singleselect.tsx";

export function SelectAisle(props: {
  token: string;
}) {
  const aisles = useAllAisles(props.token);

  if (!aisles.data || aisles.error) {
    return <p>Loading...</p>;
  }

  return (
    <SingleSelect
      label={"Select aisle"}
      items={aisles.data.map((a) => a.name)}
      selected={"NOTHING"}
      onItemsSelected={(item) => console.log(item)}
    />
  );
}
