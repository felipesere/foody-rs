class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  validates :unit, presence: true

  def self.from_quantity_string(raw)
    Quantity.parse(raw).to_attributes
  end
end
