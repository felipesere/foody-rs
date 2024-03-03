import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  return <h3>Ingredients</h3>;
}
