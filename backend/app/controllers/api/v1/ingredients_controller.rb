class Api::V1::IngredientsController < ApplicationController
  def index
    ingredients = Ingredient.all
    render json: {
      ingredients: ingredients.as_json(only: [:id, :name, :tags, :aisle_id])
    }
  end

  def show
   ingredient = Ingredient.find_by(params[:id])
   render json: ingredient.as_json(only: [:id, :name, :tags, :aisle_id])
  end

  def create
    ingredient = Ingredient.new(create_ingredient_params)
    if ingredient.save
      render json: ingredient, status: :created
    else
      render json: { errors: ingredient.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    ingredient = Ingredient.find_by(id: params["id"])
    if ingredient.update(ingredient_params)
      render json: ingredient, status: :ok
    else
      render status: :unprocessable_entity
    end
  end

  def destroy
    ingredient = Ingredient.find_by(id: params["id"])
    ingredient.destroy
  end

  private

  def create_ingredient_params
    params.expect(ingredient: [:name])
      .merge(params.fetch(:ingredient, {}).permit(:aisle_id, tags: []))
  end

  def ingredient_params
    params.require(:ingredient).permit(:name, :aisle_id, tags: [])
  end
end
