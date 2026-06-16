require 'rails_helper'

RSpec.describe "Api::V1::MealplanShoppinglists", type: :request do
  let(:plan) { create(:mealplan) }
  let(:list) { create(:shoppinglist) }

  describe "POST /api/v1/mealplans/:id/shoppinglists/:id" do
    it "adds uncooked recipe ingredients to the list" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 500)
      create(:mealplan_meal, mealplan: plan, recipe: recipe, is_cooked: false)

      post "/api/v1/mealplans/#{plan.id}/shoppinglists/#{list.id}"

      expect(response).to have_http_status(:no_content)
      item = list.shoppinglist_items.find_by(ingredient: flour)
      expect(item.shoppinglist_quantities.first).to have_attributes(unit: "gram", value: 500.0, recipe_id: recipe.id)
    end

    it "skips recipes that already have ingredients on the list" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 500)
      create(:mealplan_meal, mealplan: plan, recipe: recipe, is_cooked: false)

      post "/api/v1/shoppinglists/#{list.id}/recipes/#{recipe.id}"
      expect(list.reload.shoppinglist_items.first.shoppinglist_quantities.count).to eq(1)

      post "/api/v1/mealplans/#{plan.id}/shoppinglists/#{list.id}"

      expect(list.reload.shoppinglist_items.first.shoppinglist_quantities.count).to eq(1)
    end

    it "skips cooked meals" do
      recipe = create(:recipe)
      flour  = create(:ingredient, name: "Flour")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 500)
      create(:mealplan_meal, mealplan: plan, recipe: recipe, is_cooked: true)

      post "/api/v1/mealplans/#{plan.id}/shoppinglists/#{list.id}"

      expect(response).to have_http_status(:no_content)
      expect(list.shoppinglist_items).to be_empty
    end

    it "skips untracked meals" do
      create(:mealplan_meal, :untracked, mealplan: plan, untracked_meal_name: "Leftovers")

      post "/api/v1/mealplans/#{plan.id}/shoppinglists/#{list.id}"

      expect(response).to have_http_status(:no_content)
      expect(list.shoppinglist_items).to be_empty
    end
  end
end
