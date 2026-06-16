FactoryBot.define do
  factory :mealplan do
    sequence(:name) { |n| "Mealplan #{n}" }
  end
end
