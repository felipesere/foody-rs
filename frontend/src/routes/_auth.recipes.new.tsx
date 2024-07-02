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
import { type Recipe, useCreateRecipe } from "../apis/recipes.ts";

import { EditRecipeFrom } from "../components/editRecipeFrom.tsx";

export const Route = createFileRoute("/_auth/recipes/new")({
  component: NewRecipePage,
});

function NewRecipePage() {
  const { token } = Route.useRouteContext();

  const createRecipe = useCreateRecipe(token);
  const navigate = useNavigate({ from: "/recipes/new" });

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

  const recipe: Recipe = {
    ingredients: [],
    name: "",
    page: 0,
    source: "book",
    title: "",
    id: 0,
  };

  return (
    <FloatingOverlay
      lockScroll
      className={
        "the-overlay-backdrop py-4 bg-black/25 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
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
            recipe={recipe}
            onSubmit={(r) => {
              createRecipe.mutate(r);
            }}
            onClose={() => {
              return navigate({ to: "/recipes" });
            }}
          />
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );
}
