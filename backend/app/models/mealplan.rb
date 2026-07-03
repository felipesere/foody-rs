class Mealplan < ApplicationRecord
  include GroupScoped
  include UserAttributed

  has_many :mealplan_meals, dependent: :destroy

  validates :name, presence: true

  scope :with_full_meals, -> { includes(:mealplan_meals) }
end
