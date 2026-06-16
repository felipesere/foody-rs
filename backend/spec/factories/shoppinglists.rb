FactoryBot.define do
  factory :shoppinglist do
    sequence(:name) { |n| "Shopping list #{n}" }
  end
end
