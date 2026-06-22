class ShoppinglistSerializer
  def initialize(shoppinglist, minimal: false)
    @shoppinglist = shoppinglist
    @minimal = minimal
  end

  def as_json(*)
    base = {
      kind:         "shoppinglist",
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
    Payloads.shoppinglist_item(item)
  end
end
