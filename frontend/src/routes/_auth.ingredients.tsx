import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/ingredients")({
  component: IngredientsPage,
});

function IngredientsPage() {
  return <h3>Ingredients</h3>;
}
