class Recipe < ApplicationRecord
  include GroupScoped
  include UserAttributed

  SOURCES = %w[book website].freeze

  has_many :recipe_ingredients, dependent: :destroy
  has_many :ingredients, through: :recipe_ingredients

  validates :name, presence: true
  validates :source, inclusion: {in: SOURCES}
  validates :book_title, :book_page, presence: true, if: -> { source == "book" }
  validates :website_url, presence: true, if: -> { source == "website" }

  scope :with_full_ingredients,
    -> { includes(recipe_ingredients: {ingredient: :aisle}) }

  def self.all_tags
    pluck(:tags).flatten.uniq
  end
end
