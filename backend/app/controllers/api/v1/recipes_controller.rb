class Api::V1::RecipesController < ApplicationController
  def index
    recipes = Recipe.with_full_ingredients
    render json: { recipes: recipes.map { |r| RecipeSerializer.new(r).as_json } }
  end

  def show
    recipe = Recipe.with_full_ingredients.find(params[:id])
    render json: RecipeSerializer.new(recipe).as_json
  end

  def create
    recipe = Recipe.new(recipe_params)
    recipe.recipe_ingredients = build_recipe_ingredients(params[:ingredients])

    if recipe.save
      render json: RecipeSerializer.new(recipe).as_json, status: :created
    else
      render json: { errors: recipe.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    recipe = Recipe.find(params[:id])
    if recipe.update(recipe_params)
      render json: RecipeSerializer.new(recipe.reload).as_json
    else
      render json: { errors: recipe.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    Recipe.find(params[:id]).destroy
    head :no_content
  end

  def tags
    render json: { tags: Recipe.all_tags }
  end

  private

  def recipe_params
    params.require(:recipe).permit(
      :name, :source, :book_title, :book_page, :website_url,
      :rating, :notes, :duration, tags: []
    )
  end

  def build_recipe_ingredients(rows)
    Array(rows).map do |row|
      RecipeIngredient.new(
        ingredient_id: row[:ingredient_id],
        **RecipeIngredient.from_quantity_string(row[:quantity].to_s)
      )
    end
  end
end
