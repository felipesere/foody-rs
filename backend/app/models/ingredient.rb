class Ingredient < ApplicationRecord
  belongs_to :aisle, optional: true
  belongs_to :storage, class_name: "StorageLocation", optional: true

  validates :name, presence: true

  def self.all_tags
    pluck(:tags).flatten.uniq.sort
  end
end
