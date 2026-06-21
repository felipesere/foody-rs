class Aisle < ApplicationRecord
  validates :name, presence: true
  validates :order, presence: true, numericality:  { only_integer: true }

  before_validation on: :create do
    self.order ||= (Aisle.maximum(:order) || 0) + 1
  end
end
