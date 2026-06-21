require 'rails_helper'

RSpec.describe "Api::V1::Ingredients", type: :request do
  describe "GET /" do
    it "lists all known ingredients" do
      apples = Ingredient.create!(name: "Apples", tags: ["fruit"])
      banana = Ingredient.create!(name: "Bananas")

      get "/api/v1/ingredients"

      ingredients = response.parsed_body["ingredients"]
      expect(ingredients).to eq([
        {"kind" => "ingredient", "id" => 1, "name" => "Apples",  "tags" => ["fruit"], "aisle" => nil},
        {"kind" => "ingredient", "id" => 2, "name" => "Bananas", "tags" => [],        "aisle" => nil}
      ])
    end
  end

  describe "GET /:id" do
    it "shows a single ingredient" do
      apples = Ingredient.create!(name: "Apples", tags: ["fruit"])

      get "/api/v1/ingredients/#{apples.id}"
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to eq({"kind" => "ingredient", "id" => 1, "name" => "Apples", "tags" => ["fruit"], "aisle" => nil})
    end
  end

  describe "POST /" do
    it "creates a new ingredient" do
      post "/api/v1/ingredients", params: { name: "Apples", tags: ["fruit", "M&S"] }, as: :json
      expect(response).to have_http_status(:success)
      ingredient = response.parsed_body

      get "/api/v1/ingredients/#{ingredient["id"]}"
      expect(response).to have_http_status(:success)
      ingredient = response.parsed_body
      expect(ingredient).to match a_hash_including( "name" => "Apples", "tags" => ["fruit", "M&S"])
    end
  end

 describe "PUT /:id" do
    it "updates the ingredient" do
      post "/api/v1/ingredients", params: { name: "Apples", tags: ["fruit", "M&S"] }, as: :json
      expect(response).to have_http_status(:success)
      ingredient = response.parsed_body

      put "/api/v1/ingredients/#{ingredient["id"]}", params: { name: "orange" }, as: :json
      expect(response).to have_http_status(:success)
      put "/api/v1/ingredients/#{ingredient["id"]}", params: { tags: ["foo"] }, as: :json
      expect(response).to have_http_status(:success)

      aisle = Aisle.create!(name: "Fruit", order: 1)
      put "/api/v1/ingredients/#{ingredient["id"]}", params: { aisle_id: aisle.id }, as: :json
      expect(response).to have_http_status(:success)

      get "/api/v1/ingredients/#{ingredient["id"]}"
      ingredient = response.parsed_body
      expect(ingredient).to match a_hash_including(
        "name"  => "orange",
        "tags"  => ["foo"],
        "aisle" => a_hash_including("id" => aisle.id, "name" => "Fruit")
      )
    end
  end

  describe "GET /tags" do
    it "returns sorted, deduplicated tags from all ingredients" do
      create(:ingredient, name: "Apples",  tags: ["fruit", "vegan"])
      create(:ingredient, name: "Bananas", tags: ["vegan", "fruit"])
      create(:ingredient, name: "Bread",   tags: ["bakery"])

      get "/api/v1/ingredients/tags"

      expect(response).to have_http_status(:success)
      expect(response.parsed_body["tags"]).to eq(["bakery", "fruit", "vegan"])
    end
  end

  describe "DELETE /:id" do
    it "deletes the ingredient" do
      ingredient = Ingredient.create!(name: "Apples", tags: ["fruit"])

      delete "/api/v1/ingredients/#{ingredient.id}"
      expect(response).to have_http_status(:success)

      expect(Ingredient.find_by(id: ingredient.id)).to be_nil
    end
  end
end
