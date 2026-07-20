require "rails_helper"

RSpec.describe "Api::V1::Mealplans", type: :request do
  describe "GET /api/v1/mealplans" do
    it "returns every plan with its meals" do
      plan = create(:mealplan, name: "This week")
      recipe = create(:recipe, name: "Risotto")
      create(:mealplan_meal, mealplan: plan, recipe: recipe)

      get "/api/v1/mealplans"

      expect(response).to have_http_status(:success)
      first = response.parsed_body["mealplans"].first
      expect(first).to include("name" => "This week")
      expect(first["meals"].first["details"]).to eq("kind" => "from_recipe", "id" => recipe.id)
    end
  end

  describe "GET /api/v1/mealplans/:id" do
    it "returns one plan" do
      plan = create(:mealplan, name: "Single")
      get "/api/v1/mealplans/#{plan.id}"
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include("name" => "Single")
    end

    it "404s on an unknown id" do
      get "/api/v1/mealplans/999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/mealplans" do
    it "creates a plan" do
      post "/api/v1/mealplans", params: {name: "Next week"}, as: :json
      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("name" => "Next week", "meals" => [])
    end

    it "with keep_uncooked carries uncooked meals from the previous plan" do
      previous = create(:mealplan, name: "Old", created_at: 1.day.ago)
      recipe = create(:recipe, name: "Pasta")
      create(:mealplan_meal, mealplan: previous, recipe: recipe, is_cooked: false)
      create(:mealplan_meal, :untracked, mealplan: previous, untracked_meal_name: "Done", is_cooked: true)

      post "/api/v1/mealplans", params: {name: "New", keep_uncooked: true}, as: :json

      expect(response).to have_http_status(:created)
      details = response.parsed_body["meals"].map { |m| m["details"] }
      expect(details).to eq([{"kind" => "from_recipe", "id" => recipe.id}])
    end

    it "returns 422 when name is blank" do
      post "/api/v1/mealplans", params: {name: ""}, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "DELETE /api/v1/mealplans/:id" do
    it "deletes the plan and its meals" do
      plan = create(:mealplan)
      create(:mealplan_meal, mealplan: plan)

      expect {
        delete "/api/v1/mealplans/#{plan.id}"
      }.to change(Mealplan, :count).by(-1)
        .and change(MealplanMeal, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  describe "POST /api/v1/mealplans/:id/clear" do
    it "removes every meal but keeps the plan" do
      plan = create(:mealplan)
      create(:mealplan_meal, mealplan: plan)

      post "/api/v1/mealplans/#{plan.id}/clear"

      expect(response).to have_http_status(:no_content)
      expect(plan.reload.mealplan_meals).to be_empty
      expect(Mealplan.find(plan.id)).to be_present
    end
  end
end
