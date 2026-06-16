FactoryBot.define do
  factory :mealplan_meal do
    mealplan
    is_cooked { false }
    section   { nil }

    # default to a recipe-backed meal
    recipe

    trait :untracked do
      recipe { nil }
      untracked_meal_name { "Frozen pizza" }
    end
  end
end
