require 'rails_helper'

RSpec.describe RecipeIngredient, type: :model do
  describe "validations" do
    it "requires a recipe and an ingredient" do
      ri = RecipeIngredient.new(unit: "count", value: 1)
      expect(ri).not_to be_valid
      expect(ri.errors[:recipe]).to be_present
      expect(ri.errors[:ingredient]).to be_present
    end

    it "requires a unit" do
      ri = build(:recipe_ingredient, unit: nil)
      expect(ri).not_to be_valid
      expect(ri.errors[:unit]).to be_present
    end

    it "prevents the same ingredient appearing twice in one recipe" do
      ri = create(:recipe_ingredient)
      duplicate = build(:recipe_ingredient, recipe: ri.recipe, ingredient: ri.ingredient)

      expect { duplicate.save!(validate: false) }
        .to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe ".from_quantity_string" do
    it "returns a hash that can be splatted into create" do
      recipe = create(:recipe)
      ingredient = create(:ingredient, name: "Flour")

      ri = RecipeIngredient.create!(
        recipe: recipe,
        ingredient: ingredient,
        **RecipeIngredient.from_quantity_string("250g")
      )

      expect(ri.unit).to eq("gram")
      expect(ri.value).to eq(250.0)
      expect(ri.text).to be_nil
    end

    it "stores unparseable strings as arbitrary text" do
      attrs = RecipeIngredient.from_quantity_string("a pinch")
      expect(attrs).to eq(unit: "arbitrary", value: nil, text: "a pinch")
    end
  end
end
