class RecipeIngredient < ApplicationRecord
  include GroupScoped

  belongs_to :recipe
  belongs_to :ingredient

  validates :unit, presence: true
  validates :ingredient_id, uniqueness: {scope: :recipe_id}

  def self.from_quantity_string(raw)
    Quantity.parse(raw).to_attributes
  end
end
