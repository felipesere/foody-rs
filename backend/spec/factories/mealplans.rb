FactoryBot.define do
  factory :mealplan do
    sequence(:name) { |n| "Mealplan #{n}" }
    group { Current.group || association(:group) }
  end
end
