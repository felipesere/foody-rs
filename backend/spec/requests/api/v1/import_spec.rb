require 'rails_helper'

RSpec.describe "Api::V1::Import", type: :request do
  let(:payload) do
    {
      "version" => 1,
      "aisles" => [
        { "name" => "vegetable", "order" => 1 },
        { "name" => "dairy",     "order" => 5 }
      ],
      "storages" => [
        { "name" => "fridge", "order" => 1 }
      ],
      "ingredients" => [
        { "name" => "Flour",  "tags" => ["baking"],  "aisle" => nil,         "stored_in" => nil },
        { "name" => "Butter", "tags" => [],          "aisle" => "dairy",     "stored_in" => "fridge" }
      ],
      "recipes" => [
        {
          "name" => "Shortbread", "source" => "book",
          "book_title" => "Baking", "book_page" => 12, "website_url" => nil,
          "tags" => ["dessert"], "rating" => 4, "notes" => "", "duration" => "30m",
          "ingredients" => [
            { "name" => "Flour",  "quantity" => { "unit" => "gram", "value" => 250.0 } },
            { "name" => "Butter", "quantity" => { "unit" => "gram", "value" => 125.0 } }
          ]
        }
      ],
      "meal_plans" => [
        {
          "name" => "Week 1",
          "meals" => [
            { "recipe" => "Shortbread",   "section" => "snacks", "is_cooked" => true },
            { "untracked_meal_name" => "Leftovers", "section" => nil, "is_cooked" => false }
          ]
        }
      ],
      "shoppinglists" => [
        {
          "name" => "Saturday",
          "items" => [
            { "ingredient" => "Flour",  "quantity" => { "unit" => "gram", "value" => 500.0 }, "in_basket" => false, "from_recipe" => "Shortbread", "note" => nil },
            { "ingredient" => "Flour",  "quantity" => { "unit" => "cup",  "value" => 1.0 },   "in_basket" => true,  "from_recipe" => nil,         "note" => "plain" },
            { "ingredient" => "Butter", "quantity" => { "unit" => "gram", "value" => 200.0 }, "in_basket" => false, "from_recipe" => "Shortbread", "note" => nil }
          ]
        }
      ]
    }
  end

  describe "POST /api/v1/import" do
    it "creates aisles, ingredients with aisles linked, and recipes with their ingredients" do
      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:success)
      expect(Aisle.count).to eq(2)
      expect(Ingredient.find_by(name: "Butter").aisle.name).to eq("dairy")
      shortbread = Recipe.find_by(name: "Shortbread")
      expect(shortbread.recipe_ingredients.size).to eq(2)
      flour_ri = shortbread.recipe_ingredients.find_by(ingredient: Ingredient.find_by(name: "Flour"))
      expect(flour_ri).to have_attributes(unit: "gram", value: 250.0)
    end

    it "creates mealplans with recipe and untracked meals" do
      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      plan = Mealplan.find_by(name: "Week 1")
      expect(plan.mealplan_meals.size).to eq(2)
      recipe_meal = plan.mealplan_meals.find { |m| m.recipe.present? }
      untracked   = plan.mealplan_meals.find { |m| m.untracked_meal_name.present? }
      expect(recipe_meal.recipe.name).to eq("Shortbread")
      expect(untracked.untracked_meal_name).to eq("Leftovers")
    end

    it "merges duplicate ingredients on a shoppinglist into one item with many quantities" do
      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      list = Shoppinglist.find_by(name: "Saturday")
      flour_item = list.shoppinglist_items.find_by(ingredient: Ingredient.find_by(name: "Flour"))
      expect(flour_item.shoppinglist_quantities.size).to eq(2)
      expect(flour_item.in_basket).to be true   # any of the rows was in_basket
      expect(flour_item.note).to eq("plain")    # first non-null note
      units = flour_item.shoppinglist_quantities.map(&:unit)
      expect(units).to contain_exactly("gram", "cup")
    end

    it "tags shoppinglist quantities with the source recipe when present" do
      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      list = Shoppinglist.find_by(name: "Saturday")
      shortbread = Recipe.find_by(name: "Shortbread")
      butter_item = list.shoppinglist_items.find_by(ingredient: Ingredient.find_by(name: "Butter"))
      expect(butter_item.shoppinglist_quantities.first.recipe_id).to eq(shortbread.id)
    end

    it "is idempotent — re-running yields the same counts" do
      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }
      counts_first = response.parsed_body["imported"]

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }
      expect(response.parsed_body["imported"]).to eq(counts_first)
    end

    it "tolerates the same ingredient appearing twice in a recipe (last quantity wins)" do
      payload["recipes"][0]["ingredients"] << { "name" => "Flour", "quantity" => { "unit" => "cup", "value" => 2.0 } }

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:success)
      shortbread = Recipe.find_by(name: "Shortbread")
      flour_ri = shortbread.recipe_ingredients.find_by(ingredient: Ingredient.find_by(name: "Flour"))
      expect(shortbread.recipe_ingredients.size).to eq(2)
      expect(flour_ri).to have_attributes(unit: "cup", value: 2.0)
    end

    it "includes the recipe name when a recipe fails validation" do
      payload["recipes"][0]["book_title"] = nil

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body["errors"].first).to include("Book title can't be blank", "recipe: Shortbread")
    end

    it "rejects malformed JSON with 400" do
      post "/api/v1/import", params: "not json", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:bad_request)
    end
  end
end
