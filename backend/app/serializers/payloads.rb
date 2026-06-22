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

  def shoppinglist_item(item)
    {
      kind:       "shoppinglist_item",
      id:         item.id,
      ingredient: ingredient(item.ingredient),
      quantities: item.shoppinglist_quantities.map { |q| quantity(q) },
      note:       item.note,
      in_basket:  item.in_basket
    }
  end

  def quantity(quantity)
    {
      id:        quantity.id,
      unit:      quantity.unit,
      value:     quantity.value,
      text:      quantity.text,
      recipe_id: quantity.recipe_id
    }
  end
end
