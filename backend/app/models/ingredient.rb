class Ingredient < ApplicationRecord
  belongs_to :aisle, optional: true

  validates :name, presence: true
end
