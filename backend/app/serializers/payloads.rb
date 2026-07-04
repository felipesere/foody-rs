module Payloads
  module_function

  TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%SZ".freeze

  def timestamp(time)
    time.utc.strftime(TIMESTAMP_FORMAT)
  end

  def user(user)
    {
      kind:  "user",
      id:    user.id,
      name:  user.name,
      email: user.email,
      group: {
        id:   user.group.id,
        name: user.group.name
      }
    }
  end

  def meal(meal)
    {
      kind:       "mealplan_meal",
      id:         meal.id,
      details:    meal_details(meal),
      section:    meal.section,
      is_cooked:  meal.is_cooked,
      created_at: timestamp(meal.created_at)
    }
  end

  def meal_details(meal)
    if meal.recipe_id
      { kind: "from_recipe", id: meal.recipe_id }
    else
      { kind: "untracked", name: meal.untracked_meal_name }
    end
  end

  def ingredient(ingredient)
    {
      kind:  "ingredient",
      id:    ingredient.id,
      name:  ingredient.name,
      tags:    ingredient.tags || [],
      aisle:   ingredient.aisle && aisle(ingredient.aisle),
      storage: ingredient.storage && storage(ingredient.storage)
    }
  end

  def aisle(aisle)
    {
      id:    aisle.id,
      name:  aisle.name,
      order: aisle.order
    }
  end

  def storage(storage)
    {
      id:    storage.id,
      name:  storage.name,
      order: storage.order
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
