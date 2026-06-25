class StorageLocation < ApplicationRecord
  validates :name, presence: true
  validates :order, presence: true, numericality:  { only_integer: true }

  before_validation on: :create do
    self.order ||= (StorageLocation.maximum(:order) || 0) + 1
  end
end
