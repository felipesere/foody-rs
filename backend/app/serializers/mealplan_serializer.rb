class MealplanSerializer
  def initialize(mealplan)
    @mealplan = mealplan
  end

  def as_json(*)
    {
      kind:       "mealplan",
      id:         @mealplan.id,
      name:       @mealplan.name,
      created_at: Payloads.timestamp(@mealplan.created_at),
      meals:      @mealplan.mealplan_meals.map { |m| Payloads.meal(m) }
    }
  end
end
