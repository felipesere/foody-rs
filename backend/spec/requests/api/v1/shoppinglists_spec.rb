require 'rails_helper'

RSpec.describe "Api::V1::Shoppinglists", type: :request do
  describe "GET /api/v1/shoppinglists" do
    it "lists every list in minimal form" do
      create(:shoppinglist, name: "Weekend")
      create(:shoppinglist, name: "Party")

      get "/api/v1/shoppinglists"

      expect(response).to have_http_status(:success)
      names = response.parsed_body["shoppinglists"].map { |l| l["name"] }
      expect(names).to contain_exactly("Weekend", "Party")
      expect(response.parsed_body["shoppinglists"].first).not_to have_key("ingredients")
    end
  end

  describe "GET /api/v1/shoppinglists/:id" do
    it "returns the list with ingredients sorted by name" do
      list = create(:shoppinglist)
      banana = create(:ingredient, name: "Bananas")
      apples = create(:ingredient, name: "Apples")
      create(:shoppinglist_item, shoppinglist: list, ingredient: banana)
      create(:shoppinglist_item, shoppinglist: list, ingredient: apples)

      get "/api/v1/shoppinglists/#{list.id}"

      expect(response).to have_http_status(:success)
      names = response.parsed_body["ingredients"].map { |i| i["ingredient"]["name"] }
      expect(names).to eq(["Apples", "Bananas"])
    end

    it "404s on an unknown id" do
      get "/api/v1/shoppinglists/999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/shoppinglists" do
    it "creates a new list" do
      post "/api/v1/shoppinglists", params: { name: "Groceries" }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("name" => "Groceries")
    end

    it "returns 422 when invalid" do
      post "/api/v1/shoppinglists", params: { name: "" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/shoppinglists/:id" do
    it "deletes the list and its items" do
      list = create(:shoppinglist)
      create(:shoppinglist_item, shoppinglist: list)

      expect {
        delete "/api/v1/shoppinglists/#{list.id}"
      }.to change(Shoppinglist, :count).by(-1)
       .and change(ShoppinglistItem, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/v1/shoppinglists/:id/clear" do
    it "removes only items marked in_basket" do
      list = create(:shoppinglist)
      checked = create(:shoppinglist_item, shoppinglist: list, in_basket: true)
      unchecked = create(:shoppinglist_item, shoppinglist: list, in_basket: false)

      post "/api/v1/shoppinglists/#{list.id}/clear"

      expect(response).to have_http_status(:no_content)
      expect(ShoppinglistItem.find_by(id: checked.id)).to be_nil
      expect(ShoppinglistItem.find_by(id: unchecked.id)).to be_present
    end
  end
end
