FactoryBot.define do
  factory :shoppinglist do
    sequence(:name) { |n| "Shopping list #{n}" }
    group { Current.group || association(:group) }
  end
end
