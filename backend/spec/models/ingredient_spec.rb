require 'rails_helper'

RSpec.describe Ingredient, type: :model do
  describe "validations" do
    it "requires a name" do
      ingredient = Ingredient.new(name: "")
      expect(ingredient).not_to be_valid
      expect(ingredient.errors[:name]).to be_present
    end

    it "is valid with just a name" do
      expect(build(:ingredient, name: "Flour")).to be_valid
    end
  end
end
