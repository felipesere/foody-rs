class MealplanMeal < ApplicationRecord
  belongs_to :mealplan
  belongs_to :recipe, optional: true

  validate :exactly_one_source

  private

  def exactly_one_source
    has_recipe = recipe.present?
    has_name   = untracked_meal_name.present?
    if has_recipe == has_name
      errors.add(:base, "must have either a recipe or an untracked_meal_name, not both")
    end
  end
end
