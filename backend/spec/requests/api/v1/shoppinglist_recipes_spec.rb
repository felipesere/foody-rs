require 'rails_helper'

RSpec.describe "Api::V1::ShoppinglistRecipes", type: :request do
  let(:list) { create(:shoppinglist) }

  describe "POST /api/v1/shoppinglists/:id/recipes/:id" do
    it "adds each recipe ingredient as an item + tagged quantity" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      sugar  = create(:ingredient, name: "Sugar")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 500)
      create(:recipe_ingredient, recipe: recipe, ingredient: sugar, unit: "gram", value: 100)

      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"

      expect(response).to have_http_status(:no_content)
      expect(list.shoppinglist_items.count).to eq(2)
      quantity = list.shoppinglist_items.find_by(ingredient: flour).shoppinglist_quantities.first
      expect(quantity.unit).to eq("gram")
      expect(quantity.value).to eq(500.0)
      expect(quantity.recipe_id).to eq(recipe.id)
    end

    it "appends a second quantity if the ingredient is already on the list" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      existing = create(:shoppinglist_item, shoppinglist: list, ingredient: flour)
      create(:shoppinglist_quantity, shoppinglist_item: existing, unit: "gram", value: 200)
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "cup", value: 1)

      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"

      expect(response).to have_http_status(:no_content)
      expect(list.shoppinglist_items.count).to eq(1)
      units = existing.reload.shoppinglist_quantities.map(&:unit)
      expect(units).to contain_exactly("gram", "cup")
    end
  end

  describe "DELETE /api/v1/shoppinglists/:id/recipes/:id" do
    it "removes quantities from that recipe and cleans up orphan items" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      sugar  = create(:ingredient, name: "Sugar")

      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 500)
      create(:recipe_ingredient, recipe: recipe, ingredient: sugar, unit: "gram", value: 100)
      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"

      manual = create(:shoppinglist_item, shoppinglist: list, ingredient: create(:ingredient, name: "Eggs"))
      create(:shoppinglist_quantity, shoppinglist_item: manual)

      delete "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"

      expect(response).to have_http_status(:no_content)
      expect(list.shoppinglist_items.reload.map { |i| i.ingredient.name }).to eq(["Eggs"])
    end

    it "leaves quantities from other recipes alone" do
      recipe_a = create(:recipe, name: "A")
      recipe_b = create(:recipe, name: "B")
      flour    = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe_a, ingredient: flour, unit: "gram", value: 500)
      create(:recipe_ingredient, recipe: recipe_b, ingredient: flour, unit: "cup",  value: 1)

      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe_a.id}"
      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe_b.id}"

      delete "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe_a.id}"

      remaining = list.shoppinglist_items.find_by(ingredient: flour).shoppinglist_quantities
      expect(remaining.map(&:unit)).to eq(["cup"])
    end
  end
end
