class Api::V1::MealplanMealsController < ApplicationController
  def create
    plan = Mealplan.find(params[:mealplan_id])
    meal = plan.mealplan_meals.new(section: params[:section], **details_attributes)

    if meal.save
      render json: serialize(meal), status: :created
    else
      render json: { errors: meal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    meal = MealplanMeal.where(mealplan_id: params[:mealplan_id]).find(params[:id])
    if meal.update(meal_params)
      render json: serialize(meal)
    else
      render json: { errors: meal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    MealplanMeal.where(mealplan_id: params[:mealplan_id])
                .find(params[:id])
                .destroy
    head :no_content
  end

  private

  def meal_params
    params.permit(:is_cooked, :section)
  end

  def details_attributes
    details = params[:details] || {}
    case details[:type]
    when "from_recipe"
      { recipe_id: details[:id], untracked_meal_name: nil }
    when "untracked"
      { recipe_id: nil, untracked_meal_name: details[:name] }
    else
      {}
    end
  end

  def serialize(meal)
    {
      id:        meal.id,
      details:   meal.recipe_id ?
                   { type: "from_recipe", id: meal.recipe_id } :
                   { type: "untracked", name: meal.untracked_meal_name },
      section:   meal.section,
      is_cooked: meal.is_cooked
    }
  end
end
