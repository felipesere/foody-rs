import {
  FloatingFocusManager,
  FloatingOverlay,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRecipe, useUpdateRecipe } from "../apis/recipes.ts";
import { EditRecipeFrom } from "../components/editRecipeFrom.tsx";

export const Route = createFileRoute("/_auth/recipes/$recipeId/edit")({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { recipeId } = Route.useParams();
  const { token } = Route.useRouteContext();
  const data = useRecipe(token, Number(recipeId));
  const updateItem = useUpdateRecipe(token, Number(recipeId));

  const navigate = useNavigate({ from: "/recipes/$recipeId/edit" });

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: () => navigate({ to: "/recipes" }),
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context);

  // Merge all the interactions into prop getters
  const { getFloatingProps } = useInteractions([click, dismiss, role]);

  if (data.isLoading || !data.data) {
    return <p>Loading...</p>;
  }

  return (
    <FloatingOverlay
      lockScroll
      className={
        "the-overlay-backdrop py-4 bg-black/25 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-20 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
      }
      style={{ margin: 0 }}
    >
      <FloatingFocusManager context={context}>
        <div
          ref={refs.setFloating}
          {...getFloatingProps({
            className:
              "m-2 p-4 bg-white w-full h-full max-w-2xl relative border-solid border-black border-2 space-y-4",
          })}
        >
          <EditRecipeFrom
            token={token}
            recipe={data.data}
            onSubmit={(r) => updateItem.mutate(r)}
            onClose={() => navigate({ to: "/recipes" })}
          />
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
}
