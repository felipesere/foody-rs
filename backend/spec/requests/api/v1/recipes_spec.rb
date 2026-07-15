require "rails_helper"

RSpec.describe "Api::V1::Recipes", type: :request do
  describe "GET /api/v1/recipes" do
    it "lists every recipe with its ingredients" do
      aisle = create(:aisle, name: "Produce", order: 1)
      apples = create(:ingredient, name: "Apples", aisle: aisle)
      tartiflette = create(:recipe, name: "Tartiflette", tags: ["dinner"])
      create(:recipe_ingredient, recipe: tartiflette, ingredient: apples, unit: "gram", value: 200)

      get "/api/v1/recipes"

      expect(response).to have_http_status(:success)
      recipes = response.parsed_body["recipes"]
      expect(recipes.length).to eq(1)
      expect(recipes.first).to include(
        "name" => "Tartiflette",
        "source" => "book",
        "tags" => ["dinner"]
      )
      expect(recipes.first["ingredients"].first["ingredient"]["name"]).to eq("Apples")
      expect(recipes.first["ingredients"].first["ingredient"]["aisle"]).to include("name" => "Produce")
    end
  end

  describe "GET /api/v1/recipes/:id" do
    it "returns one recipe with ingredients sorted by name" do
      recipe = create(:recipe)
      banana = create(:ingredient, name: "Bananas")
      apples = create(:ingredient, name: "Apples")
      create(:recipe_ingredient, recipe: recipe, ingredient: banana, unit: "count", value: 2)
      create(:recipe_ingredient, recipe: recipe, ingredient: apples, unit: "count", value: 3)

      get "/api/v1/recipes/#{recipe.id}"

      expect(response).to have_http_status(:success)
      names = response.parsed_body["ingredients"].map { |i| i["ingredient"]["name"] }
      expect(names).to eq(["Apples", "Bananas"])
    end

    it "404s on an unknown id" do
      get "/api/v1/recipes/999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/recipes" do
    it "creates a book recipe with ingredients parsed from quantity strings" do
      apples = create(:ingredient, name: "Apples")

      post "/api/v1/recipes",
        params: {
          recipe: {
            name: "Apple Pie",
            source: "book",
            book_title: "Joy of Cooking",
            book_page: 12,
            tags: ["dessert"],
            rating: 5,
            notes: "Tasty"
          },
          ingredients: [
            {ingredient_id: apples.id, quantity: "500g"}
          ]
        },
        as: :json

      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body).to include("name" => "Apple Pie", "title" => "Joy of Cooking", "page" => 12)
      expect(body["ingredients"].first["quantities"].first).to include("unit" => "gram", "value" => 500.0)
    end

    it "creates a website recipe" do
      post "/api/v1/recipes",
        params: {
          recipe: {
            name: "Online One",
            source: "website",
            website_url: "https://example.com/r"
          }
        },
        as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("url" => "https://example.com/r", "title" => nil, "page" => nil)
    end

    it "returns 422 with errors when invalid" do
      post "/api/v1/recipes",
        params: {recipe: {name: "", source: "book"}},
        as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"]).to be_present
    end
  end

  describe "PUT /api/v1/recipes/:id" do
    it "updates editable fields" do
      recipe = create(:recipe, name: "Old", notes: "")

      put "/api/v1/recipes/#{recipe.id}",
        params: {recipe: {name: "New", notes: "yum", tags: ["a", "b"]}},
        as: :json

      expect(response).to have_http_status(:success)
      body = response.parsed_body
      expect(body).to include("name" => "New", "notes" => "yum", "tags" => ["a", "b"])
    end
  end

  describe "DELETE /api/v1/recipes/:id" do
    it "deletes the recipe and its join rows" do
      recipe = create(:recipe)
      create(:recipe_ingredient, recipe: recipe)

      expect {
        delete "/api/v1/recipes/#{recipe.id}"
      }.to change(Recipe, :count).by(-1)
        .and change(RecipeIngredient, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "GET /api/v1/recipes/tags" do
    it "returns deduplicated tags from all recipes" do
      create(:recipe, tags: ["quick", "vegan"])
      create(:recipe, tags: ["quick", "dinner"])

      get "/api/v1/recipes/tags"

      expect(response).to have_http_status(:success)
      expect(response.parsed_body["tags"]).to contain_exactly("quick", "vegan", "dinner")
    end
  end
end
