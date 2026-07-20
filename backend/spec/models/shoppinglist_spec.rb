require "rails_helper"

RSpec.describe Shoppinglist, type: :model do
  describe "validations" do
    it "requires a name" do
      list = build(:shoppinglist, name: nil)
      expect(list).not_to be_valid
      expect(list.errors[:name]).to be_present
    end
  end

  describe "associations" do
    it "destroys items and their quantities when the list is deleted" do
      list = create(:shoppinglist)
      item = create(:shoppinglist_item, shoppinglist: list)
      create(:shoppinglist_quantity, shoppinglist_item: item)

      expect { list.destroy }
        .to change(ShoppinglistItem, :count).by(-1)
        .and change(ShoppinglistQuantity, :count).by(-1)
    end

    it "reaches ingredients through items" do
      list = create(:shoppinglist)
      flour = create(:ingredient, name: "Flour")
      create(:shoppinglist_item, shoppinglist: list, ingredient: flour)

      expect(list.ingredients).to contain_exactly(flour)
    end
  end

  describe ".with_full_items" do
    it "eager-loads items, ingredients, aisles, and quantities" do
      list = create(:shoppinglist)
      aisle = create(:aisle, name: "Produce", order: 1)
      apples = create(:ingredient, name: "Apples", aisle: aisle)
      item = create(:shoppinglist_item, shoppinglist: list, ingredient: apples)
      create(:shoppinglist_quantity, shoppinglist_item: item)

      loaded = Shoppinglist.with_full_items.find(list.id)

      expect(loaded.association(:shoppinglist_items)).to be_loaded
      expect(loaded.shoppinglist_items.first.association(:ingredient)).to be_loaded
      expect(loaded.shoppinglist_items.first.ingredient.association(:aisle)).to be_loaded
      expect(loaded.shoppinglist_items.first.association(:shoppinglist_quantities)).to be_loaded
    end
  end
end
