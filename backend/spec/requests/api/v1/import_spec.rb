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

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"].first).to include("Book title can't be blank", "recipe: Shortbread")
    end

    it "fills in 'No book' when a book recipe has an empty book_title" do
      payload["recipes"][0]["book_title"] = ""

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }

      expect(response).to have_http_status(:success)
      expect(Recipe.find_by(name: "Shortbread").book_title).to eq("No book")
    end

    it "rejects malformed JSON with 400" do
      post "/api/v1/import", params: "not json", headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:bad_request)
    end

    it "honors created_at on top-level and nested records when provided" do
      aisle_ts        = "2025-01-28T22:34:43.835478Z"
      ingredient_ts   = "2025-02-01T10:00:00Z"
      recipe_ts       = "2025-03-01T10:00:00Z"
      recipe_ing_ts   = "2025-03-02T10:00:00Z"
      mealplan_ts     = "2025-04-01T10:00:00Z"
      meal_ts         = "2025-04-02T10:00:00Z"
      shoppinglist_ts = "2025-05-01T10:00:00Z"
      item_early_ts   = "2025-05-02T10:00:00Z"
      item_late_ts    = "2025-05-02T11:00:00Z"

      payload["aisles"][0]["created_at"]                          = aisle_ts
      payload["ingredients"][0]["created_at"]                     = ingredient_ts
      payload["recipes"][0]["created_at"]                         = recipe_ts
      payload["recipes"][0]["ingredients"][0]["created_at"]       = recipe_ing_ts
      payload["meal_plans"][0]["created_at"]                      = mealplan_ts
      payload["meal_plans"][0]["meals"][0]["created_at"]          = meal_ts
      payload["shoppinglists"][0]["created_at"]                   = shoppinglist_ts
      payload["shoppinglists"][0]["items"][0]["created_at"]       = item_late_ts
      payload["shoppinglists"][0]["items"][1]["created_at"]       = item_early_ts

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:success)

      expect(Aisle.find_by(name: "vegetable").created_at).to eq(Time.parse(aisle_ts))
      expect(Ingredient.find_by(name: "Flour").created_at).to eq(Time.parse(ingredient_ts))

      shortbread = Recipe.find_by(name: "Shortbread")
      expect(shortbread.created_at).to eq(Time.parse(recipe_ts))
      flour_ri = shortbread.recipe_ingredients.find_by(ingredient: Ingredient.find_by(name: "Flour"))
      expect(flour_ri.created_at).to eq(Time.parse(recipe_ing_ts))

      plan = Mealplan.find_by(name: "Week 1")
      expect(plan.created_at).to eq(Time.parse(mealplan_ts))
      expect(plan.mealplan_meals.find_by(recipe: shortbread).created_at).to eq(Time.parse(meal_ts))

      list = Shoppinglist.find_by(name: "Saturday")
      expect(list.created_at).to eq(Time.parse(shoppinglist_ts))
      expect(list.updated_at).to eq(Time.parse(shoppinglist_ts))
      flour_item = list.shoppinglist_items.find_by(ingredient: Ingredient.find_by(name: "Flour"))
      expect(flour_item.created_at).to eq(Time.parse(item_early_ts))
      expect(flour_item.shoppinglist_quantities.map(&:created_at)).to contain_exactly(Time.parse(item_late_ts), Time.parse(item_early_ts))
    end

    it "accepts the dump as an uploaded JSON file" do
      file = Rack::Test::UploadedFile.new(
        StringIO.new(payload.to_json), "application/json", original_filename: "export.json"
      )

      post "/api/v1/import", params: { file: file }

      expect(response).to have_http_status(:success)
      expect(Aisle.count).to eq(2)
      expect(Recipe.find_by(name: "Shortbread").recipe_ingredients.size).to eq(2)
    end

    it "imports into the current group without touching another group's catalog" do
      other = create(:group)
      other_aisle = create(:aisle, name: "vegetable", order: 1, group: other)

      post "/api/v1/import", params: payload.to_json, headers: { "Content-Type" => "application/json" }
      expect(response).to have_http_status(:ok)

      mine = Current.group.aisles.find_by(name: "vegetable")
      expect(mine).to be_present
      expect(mine.id).not_to eq(other_aisle.id)
      expect(other.aisles.pluck(:name)).to eq(["vegetable"]) # untouched, still one
    end
  end
end
