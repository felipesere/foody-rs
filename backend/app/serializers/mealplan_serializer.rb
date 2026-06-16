class MealplanSerializer
  TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%SZ".freeze

  def initialize(mealplan)
    @mealplan = mealplan
  end

  def as_json(*)
    {
      id:         @mealplan.id,
      name:       @mealplan.name,
      created_at: @mealplan.created_at.utc.strftime(TIMESTAMP_FORMAT),
      meals:      @mealplan.mealplan_meals.map { |m| meal_payload(m) }
    }
  end

  private

  def meal_payload(meal)
    {
      id:         meal.id,
      details:    meal_details(meal),
      section:    meal.section,
      is_cooked:  meal.is_cooked,
      created_at: meal.created_at.utc.strftime(TIMESTAMP_FORMAT)
    }
  end

  def meal_details(meal)
    if meal.recipe_id
      { type: "from_recipe", id: meal.recipe_id }
    else
      { type: "untracked", name: meal.untracked_meal_name }
    end
  end
end
