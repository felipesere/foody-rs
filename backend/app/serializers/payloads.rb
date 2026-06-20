module Payloads
  module_function

  def ingredient(ingredient)
    {
      kind:  "ingredient",
      id:    ingredient.id,
      name:  ingredient.name,
      tags:  ingredient.tags || [],
      aisle: ingredient.aisle && aisle(ingredient.aisle)
    }
  end

  def aisle(aisle)
    {
      id:    aisle.id,
      name:  aisle.name,
      order: aisle.order
    }
  end
end
