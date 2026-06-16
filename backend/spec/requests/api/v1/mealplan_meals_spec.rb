require 'rails_helper'

RSpec.describe "Api::V1::MealplanMeals", type: :request do
  let(:plan) { create(:mealplan) }

  describe "POST /api/v1/mealplans/:id/meals" do
    it "adds a recipe-backed meal" do
      recipe = create(:recipe, name: "Soup")

      post "/api/v1/mealplans/#{plan.id}/meals",
           params: { details: { type: "from_recipe", id: recipe.id }, section: "Mon" },
           as: :json

      expect(response).to have_http_status(:created)
      meal = plan.mealplan_meals.last
      expect(meal.recipe_id).to eq(recipe.id)
      expect(meal.section).to eq("Mon")
    end

    it "adds an untracked meal" do
      post "/api/v1/mealplans/#{plan.id}/meals",
           params: { details: { type: "untracked", name: "Leftovers" } },
           as: :json

      expect(response).to have_http_status(:created)
      meal = plan.mealplan_meals.last
      expect(meal.recipe_id).to be_nil
      expect(meal.untracked_meal_name).to eq("Leftovers")
    end

    it "rejects a meal without details" do
      post "/api/v1/mealplans/#{plan.id}/meals", params: {}, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PUT /api/v1/mealplans/:id/meals/:id" do
    it "marks a meal as cooked" do
      meal = create(:mealplan_meal, mealplan: plan)

      put "/api/v1/mealplans/#{plan.id}/meals/#{meal.id}",
          params: { is_cooked: true },
          as: :json

      expect(response).to have_http_status(:success)
      expect(meal.reload.is_cooked).to be true
    end

    it "sets the section" do
      meal = create(:mealplan_meal, mealplan: plan)

      put "/api/v1/mealplans/#{plan.id}/meals/#{meal.id}",
          params: { section: "Tue" },
          as: :json

      expect(response).to have_http_status(:success)
      expect(meal.reload.section).to eq("Tue")
    end
  end

  describe "DELETE /api/v1/mealplans/:id/meals/:id" do
    it "removes the meal" do
      meal = create(:mealplan_meal, mealplan: plan)

      expect {
        delete "/api/v1/mealplans/#{plan.id}/meals/#{meal.id}"
      }.to change(MealplanMeal, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
