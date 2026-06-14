require 'rails_helper'

RSpec.describe "Api::V1::RecipeIngredients", type: :request do
  describe "POST /api/v1/recipes/:recipe_id/ingredients" do
    it "adds an ingredient with a parsed quantity" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")

      post "/api/v1/recipes/#{recipe.id}/ingredients",
           params: { ingredient_id: flour.id, quantity: "250g" },
           as: :json

      expect(response).to have_http_status(:created)
      ri = recipe.recipe_ingredients.find_by(ingredient: flour)
      expect(ri.unit).to eq("gram")
      expect(ri.value).to eq(250.0)
    end

    it "stores unparseable quantities as arbitrary text" do
      recipe = create(:recipe)
      salt   = create(:ingredient, name: "Salt")

      post "/api/v1/recipes/#{recipe.id}/ingredients",
           params: { ingredient_id: salt.id, quantity: "a pinch" },
           as: :json

      expect(response).to have_http_status(:created)
      ri = recipe.recipe_ingredients.find_by(ingredient: salt)
      expect(ri.unit).to eq("arbitrary")
      expect(ri.text).to eq("a pinch")
    end

    it "rejects adding the same ingredient twice" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour)

      post "/api/v1/recipes/#{recipe.id}/ingredients",
           params: { ingredient_id: flour.id, quantity: "100g" },
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/recipes/:recipe_id/ingredients/:id" do
    it "removes the ingredient from the recipe but leaves the catalog entry" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour)

      delete "/api/v1/recipes/#{recipe.id}/ingredients/#{flour.id}"

      expect(response).to have_http_status(:no_content)
      expect(recipe.reload.ingredients).to be_empty
      expect(Ingredient.find(flour.id)).to be_present
    end
  end
end
