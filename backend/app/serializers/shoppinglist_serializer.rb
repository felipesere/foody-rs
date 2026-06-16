class ShoppinglistSerializer
  def initialize(shoppinglist, minimal: false)
    @shoppinglist = shoppinglist
    @minimal = minimal
  end

  def as_json(*)
    base = {
      id:           @shoppinglist.id,
      name:         @shoppinglist.name,
      last_updated: @shoppinglist.updated_at.utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    return base if @minimal

    base.merge(ingredients: sorted_items.map { |item| item_payload(item) })
  end

  private

  def sorted_items
    @shoppinglist.shoppinglist_items.sort_by { |i| i.ingredient.name }
  end

  def item_payload(item)
    {
      id:         item.id,
      ingredient: ingredient_payload(item.ingredient),
      note:       item.note,
      in_basket:  item.in_basket,
      quantities: item.shoppinglist_quantities.map { |q| quantity_payload(q) }
    }
  end

  def quantity_payload(quantity)
    {
      id:        quantity.id,
      unit:      quantity.unit,
      value:     quantity.value,
      text:      quantity.text,
      recipe_id: quantity.recipe_id
    }
  end

  def ingredient_payload(ingredient)
    {
      id:   ingredient.id,
      name: ingredient.name,
      tags: ingredient.tags || [],
      aisle: ingredient.aisle && {
        id:    ingredient.aisle.id,
        name:  ingredient.aisle.name,
        order: ingredient.aisle.order
      }
    }
  end
end
