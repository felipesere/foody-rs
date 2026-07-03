require 'rails_helper'

RSpec.describe "Api::V1::ShoppinglistItems", type: :request do
  describe "POST /api/v1/shoppinglists/:id/items" do
    it "creates an item with the first quantity from a parsed string" do
      list = create(:shoppinglist)
      flour = create(:ingredient, name: "Flour")

      post "/api/v1/shoppinglists/#{list.id}/items",
           params: { ingredient_id: flour.id, quantity: "250g" },
           as: :json

      expect(response).to have_http_status(:created)
      item = list.shoppinglist_items.find_by(ingredient: flour)
      expect(item.shoppinglist_quantities.first).to have_attributes(unit: "gram", value: 250.0)
    end

    it "rejects adding the same ingredient twice" do
      list = create(:shoppinglist)
      flour = create(:ingredient, name: "Flour")
      create(:shoppinglist_item, shoppinglist: list, ingredient: flour)

      post "/api/v1/shoppinglists/#{list.id}/items",
           params: { ingredient_id: flour.id, quantity: "100g" },
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PUT /api/v1/shoppinglists/:id/items/:id" do
    it "updates in_basket and note" do
      list = create(:shoppinglist)
      item = create(:shoppinglist_item, shoppinglist: list)

      put "/api/v1/shoppinglists/#{list.id}/items/#{item.id}",
          params: { in_basket: true, note: "organic" },
          as: :json

      expect(response).to have_http_status(:success)
      item.reload
      expect(item.in_basket).to be true
      expect(item.note).to eq("organic")
    end
  end

  describe "DELETE /api/v1/shoppinglists/:id/items/:id" do
    it "removes the item and cascades its quantities" do
      list = create(:shoppinglist)
      item = create(:shoppinglist_item, shoppinglist: list)
      create(:shoppinglist_quantity, shoppinglist_item: item)

      expect {
        delete "/api/v1/shoppinglists/#{list.id}/items/#{item.id}"
      }.to change(ShoppinglistItem, :count).by(-1)
       .and change(ShoppinglistQuantity, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
