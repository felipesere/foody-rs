class Aisle < ApplicationRecord
  validates :name, presence: true
  validates :order, presence: true, numericality:  { only_integer: true }
end
