FactoryBot.define do
  factory :shoppinglist_item do
    shoppinglist
    ingredient
    in_basket { false }
    note      { nil }
  end
end
