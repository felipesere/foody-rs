class Api::V1::IngredientsController < ApplicationController
  def index
    ingredients = Current.group.ingredients.includes(:aisle, :storage)
    render json: {
      ingredients: ingredients.map { |i| Payloads.ingredient(i) }
    }
  end

  def show
    ingredient = Current.group.ingredients.includes(:aisle, :storage).find_by(id: params[:id])
    render json: Payloads.ingredient(ingredient)
  end

  def create
    ingredient = Current.group.ingredients.new(ingredient_params)
    if ingredient.save
      render json: Payloads.ingredient(ingredient), status: :created
    else
      render json: { errors: ingredient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    ingredient = Current.group.ingredients.find_by(id: params["id"])
    if ingredient.update(ingredient_params)
      render json: Payloads.ingredient(ingredient), status: :ok
    else
      render status: :unprocessable_entity
    end
  end

  def destroy
    ingredient = Current.group.ingredients.find_by(id: params["id"])
    ingredient.destroy
  end

  def tags
    render json: { tags: Current.group.ingredients.all_tags }
  end

  private

  def ingredient_params
    params.require(:ingredient).permit(:name, :aisle_id, :storage_id, tags: [])
  end
end
