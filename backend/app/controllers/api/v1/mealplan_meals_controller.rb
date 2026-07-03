class Api::V1::MealplanMealsController < ApplicationController
  def create
    plan = Current.group.mealplans.find(params[:mealplan_id])
    meal = plan.mealplan_meals.new(section: params[:section], **details_attributes)

    if meal.save
      render json: Payloads.meal(meal), status: :created
    else
      render json: { errors: meal.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    meal = find_meal
    if meal.update(meal_params)
      render json: Payloads.meal(meal)
    else
      render json: { errors: meal.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    find_meal.destroy
    head :no_content
  end

  private

  def find_meal
    Current.group.mealplans
           .find(params[:mealplan_id])
           .mealplan_meals.find(params[:id])
  end

  def meal_params
    params.permit(:is_cooked, :section)
  end

  def details_attributes
    details = params[:details] || {}
    case details[:kind]
    when "from_recipe"
      { recipe_id: details[:id], untracked_meal_name: nil }
    when "untracked"
      { recipe_id: nil, untracked_meal_name: details[:name] }
    else
      {}
    end
  end
end
