class ShoppinglistQuantity < ApplicationRecord
  include GroupScoped

  belongs_to :shoppinglist_item
  belongs_to :recipe, optional: true

  validates :unit, presence: true

  def self.from_quantity_string(raw)
    Quantity.parse(raw).to_attributes
  end
end
