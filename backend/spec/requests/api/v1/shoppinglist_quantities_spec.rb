require 'rails_helper'

RSpec.describe "Api::V1::ShoppinglistQuantities", type: :request do
  let(:list) { create(:shoppinglist) }
  let(:item) { create(:shoppinglist_item, shoppinglist: list) }

  describe "POST /api/v1/shoppinglists/:id/items/:item_id/quantities" do
    it "adds another parsed quantity to an existing item" do
      post "/api/v1/shoppinglists/#{list.id}/items/#{item.id}/quantities",
           params: { quantity: "1 cup" },
           as: :json

      expect(response).to have_http_status(:created)
      expect(item.shoppinglist_quantities.last.unit).to eq("cup")
    end

    it "stores unparseable quantities as arbitrary text" do
      post "/api/v1/shoppinglists/#{list.id}/items/#{item.id}/quantities",
           params: { quantity: "a pinch" },
           as: :json

      expect(response).to have_http_status(:created)
      last = item.shoppinglist_quantities.last
      expect(last.unit).to eq("arbitrary")
      expect(last.text).to eq("a pinch")
    end
  end

  describe "PUT /api/v1/shoppinglists/:id/items/:item_id/quantities/:id" do
    it "re-parses and updates the row" do
      quantity = create(:shoppinglist_quantity, shoppinglist_item: item, unit: "count", value: 1)

      put "/api/v1/shoppinglists/#{list.id}/items/#{item.id}/quantities/#{quantity.id}",
          params: { quantity: "500g" },
          as: :json

      expect(response).to have_http_status(:success)
      quantity.reload
      expect(quantity.unit).to eq("gram")
      expect(quantity.value).to eq(500.0)
    end
  end

  describe "DELETE /api/v1/shoppinglists/:id/items/:item_id/quantities/:id" do
    it "removes only that quantity row" do
      keep = create(:shoppinglist_quantity, shoppinglist_item: item)
      drop = create(:shoppinglist_quantity, shoppinglist_item: item)

      delete "/api/v1/shoppinglists/#{list.id}/items/#{item.id}/quantities/#{drop.id}"

      expect(response).to have_http_status(:no_content)
      expect(item.reload.shoppinglist_quantities).to contain_exactly(keep)
    end
  end
end
