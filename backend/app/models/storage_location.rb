class StorageLocation < ApplicationRecord
  include GroupScoped

  validates :name, presence: true
  validates :order, presence: true, numericality: {only_integer: true}

  before_validation on: :create do
    self.order ||= (self.class.where(group_id: group_id).maximum(:order) || 0) + 1
  end
end
