class Ingredient < ApplicationRecord
  belongs_to :aisle, optional: true

  validates :name, presence: true

  def self.all_tags
    pluck(:tags).flatten.uniq.sort
  end
end
