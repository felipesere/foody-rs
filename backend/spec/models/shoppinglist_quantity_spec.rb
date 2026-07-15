require "rails_helper"

RSpec.describe ShoppinglistQuantity, type: :model do
  describe "validations" do
    it "requires a shoppinglist_item" do
      q = ShoppinglistQuantity.new(unit: "count", value: 1)
      expect(q).not_to be_valid
      expect(q.errors[:shoppinglist_item]).to be_present
    end

    it "requires a unit" do
      q = build(:shoppinglist_quantity, unit: nil)
      expect(q).not_to be_valid
      expect(q.errors[:unit]).to be_present
    end

    it "allows an optional recipe" do
      recipe = create(:recipe)
      q = build(:shoppinglist_quantity, recipe: recipe)
      expect(q).to be_valid
    end
  end

  describe ".from_quantity_string" do
    it "parses a known unit string" do
      attrs = ShoppinglistQuantity.from_quantity_string("250g")
      expect(attrs).to eq(unit: "gram", value: 250.0, text: nil)
    end

    it "stores unparseable strings as arbitrary text" do
      attrs = ShoppinglistQuantity.from_quantity_string("a pinch")
      expect(attrs).to eq(unit: "arbitrary", value: nil, text: "a pinch")
    end
  end
end
