require 'rails_helper'

RSpec.describe ShoppinglistItem, type: :model do
  describe "validations" do
    it "requires a shoppinglist and an ingredient" do
      item = ShoppinglistItem.new
      expect(item).not_to be_valid
      expect(item.errors[:shoppinglist]).to be_present
      expect(item.errors[:ingredient]).to be_present
    end

    it "prevents the same ingredient appearing twice on a list" do
      item = create(:shoppinglist_item)
      duplicate = build(:shoppinglist_item,
                        shoppinglist: item.shoppinglist,
                        ingredient: item.ingredient)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:ingredient_id]).to be_present
    end

    it "enforces uniqueness at the DB level too" do
      item = create(:shoppinglist_item)
      # validate: false skips the stamping callback, so set attribution by hand
      # to leave the unique index as the only constraint under test.
      duplicate = build(:shoppinglist_item,
                        shoppinglist: item.shoppinglist,
                        ingredient: item.ingredient,
                        created_by: item.created_by,
                        updated_by: item.updated_by)

      expect { duplicate.save!(validate: false) }
        .to raise_error(ActiveRecord::RecordNotUnique)
    end
  end
end
