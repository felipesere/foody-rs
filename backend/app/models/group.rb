class Group < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :aisles, dependent: :destroy
  has_many :storage_locations, dependent: :destroy
  has_many :ingredients, dependent: :destroy
  has_many :recipes, dependent: :destroy
  has_many :shoppinglists, dependent: :destroy
  has_many :mealplans, dependent: :destroy

  validates :name, presence: true
end
