class ShoppinglistItem < ApplicationRecord
  include GroupScoped

  belongs_to :shoppinglist
  belongs_to :ingredient
  has_many :shoppinglist_quantities, dependent: :destroy

  validates :ingredient_id, uniqueness: { scope: :shoppinglist_id }
end
