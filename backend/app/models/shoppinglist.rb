class Shoppinglist < ApplicationRecord
  include GroupScoped

  has_many :shoppinglist_items, dependent: :destroy
  has_many :ingredients, through: :shoppinglist_items

  validates :name, presence: true

  scope :with_full_items,
        -> { includes(shoppinglist_items: [{ ingredient: :aisle }, :shoppinglist_quantities]) }
end
