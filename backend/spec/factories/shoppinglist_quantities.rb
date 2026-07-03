FactoryBot.define do
  factory :shoppinglist_quantity do
    shoppinglist_item
    unit  { "count" }
    value { 1.0 }
    text  { nil }
    recipe { nil }
    group { shoppinglist_item.group }
  end
end
