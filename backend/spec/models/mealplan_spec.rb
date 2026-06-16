require 'rails_helper'

RSpec.describe Mealplan, type: :model do
  describe "validations" do
    it "requires a name" do
      plan = build(:mealplan, name: nil)
      expect(plan).not_to be_valid
      expect(plan.errors[:name]).to be_present
    end
  end

  describe "associations" do
    it "destroys meals when the plan is deleted" do
      plan = create(:mealplan)
      create(:mealplan_meal, mealplan: plan)

      expect { plan.destroy }.to change(MealplanMeal, :count).by(-1)
    end
  end
end
