FactoryBot.define do
  factory :recipe_ingredient do
    recipe
    ingredient
    unit  { "count" }
    value { 1.0 }
    text  { nil }
    group { recipe.group }
  end
end
