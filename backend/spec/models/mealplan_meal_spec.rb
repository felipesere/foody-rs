require "rails_helper"

RSpec.describe MealplanMeal, type: :model do
  describe "validations" do
    it "requires a mealplan" do
      meal = MealplanMeal.new(untracked_meal_name: "Pizza")
      expect(meal).not_to be_valid
      expect(meal.errors[:mealplan]).to be_present
    end

    it "is valid with a recipe and no untracked name" do
      expect(build(:mealplan_meal)).to be_valid
    end

    it "is valid with an untracked name and no recipe" do
      expect(build(:mealplan_meal, :untracked)).to be_valid
    end

    it "rejects having both a recipe and an untracked name" do
      meal = build(:mealplan_meal, untracked_meal_name: "Pizza")
      expect(meal).not_to be_valid
      expect(meal.errors[:base]).to be_present
    end

    it "rejects having neither a recipe nor an untracked name" do
      meal = build(:mealplan_meal, recipe: nil, untracked_meal_name: nil)
      expect(meal).not_to be_valid
      expect(meal.errors[:base]).to be_present
    end
  end
end
