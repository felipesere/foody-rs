class Ingredient < ApplicationRecord
  belongs_to :aisle, optional: true
end
