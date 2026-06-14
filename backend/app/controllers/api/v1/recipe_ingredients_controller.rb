class Api::V1::RecipeIngredientsController < ApplicationController
  def create
    recipe = Recipe.find(params[:recipe_id])
    ri = recipe.recipe_ingredients.new(
      ingredient_id: params[:ingredient_id],
      **RecipeIngredient.from_quantity_string(params[:quantity].to_s)
    )

    if ri.save
      head :created
    else
      render json: { errors: ri.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    RecipeIngredient
      .where(recipe_id: params[:recipe_id], ingredient_id: params[:id])
      .delete_all
    head :no_content
  end
end
