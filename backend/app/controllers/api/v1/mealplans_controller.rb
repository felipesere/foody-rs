class Api::V1::MealplansController < ApplicationController
  def index
    plans = Current.group.mealplans.with_full_meals.order(created_at: :desc, id: :desc)
    render json: {mealplans: plans.map { |p| MealplanSerializer.new(p).as_json }}
  end

  def show
    plan = Current.group.mealplans.with_full_meals.find(params[:id])
    render json: MealplanSerializer.new(plan).as_json
  end

  def create
    plan = Current.group.mealplans.new(name: params[:name])

    Mealplan.transaction do
      plan.save!
      copy_uncooked_meals_from_previous(plan) if params[:keep_uncooked]
    end

    render json: MealplanSerializer.new(plan.reload).as_json, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: {errors: e.record.errors.full_messages}, status: :unprocessable_content
  end

  def destroy
    Current.group.mealplans.find(params[:id]).destroy
    head :no_content
  end

  def clear
    plan = Current.group.mealplans.find(params[:id])
    plan.mealplan_meals.destroy_all
    head :no_content
  end

  private

  def copy_uncooked_meals_from_previous(plan)
    previous = Current.group.mealplans.where.not(id: plan.id).order(created_at: :desc).first
    return unless previous

    previous.mealplan_meals.where(is_cooked: false).each do |meal|
      plan.mealplan_meals.create!(
        recipe_id: meal.recipe_id,
        untracked_meal_name: meal.untracked_meal_name,
        section: meal.section,
        is_cooked: false
      )
    end
  end
end
