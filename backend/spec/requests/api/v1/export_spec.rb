require "rails_helper"

RSpec.describe "Api::V1::Export", type: :request do
  describe "GET /api/v1/export" do
    it "dumps aisles and storages in their configured order" do
      create(:aisle, name: "dairy", order: 5)
      create(:aisle, name: "vegetable", order: 1)
      create(:storage_location, name: "freezer", order: 2)
      create(:storage_location, name: "fridge", order: 1)

      get "/api/v1/export"

      expect(response).to have_http_status(:success)
      expect(response.parsed_body["version"]).to eq(1)
      expect(response.parsed_body["aisles"]).to match([
        {"name" => "vegetable", "order" => 1, "created_at" => a_kind_of(String)},
        {"name" => "dairy", "order" => 5, "created_at" => a_kind_of(String)}
      ])
      expect(response.parsed_body["storages"].map { |s| s["name"] }).to eq(["fridge", "freezer"])
    end

    it "references an ingredient's aisle and storage by name" do
      aisle = create(:aisle, name: "dairy")
      storage = create(:storage_location, name: "fridge")
      create(:ingredient, name: "Butter", tags: ["spread"], aisle: aisle, storage: storage)
      create(:ingredient, name: "Flour", tags: [], aisle: nil, storage: nil)

      get "/api/v1/export"

      butter, flour = response.parsed_body["ingredients"]
      expect(butter).to include("name" => "Butter", "tags" => ["spread"], "aisle" => "dairy", "stored_in" => "fridge")
      expect(flour).to include("name" => "Flour", "aisle" => nil, "stored_in" => nil)
    end

    it "dumps recipes with their ingredients and quantities" do
      recipe = create(:recipe, name: "Shortbread", tags: ["dessert"], rating: 4, notes: "chill it", duration: "30m")
      flour = create(:ingredient, name: "Flour")
      butter = create(:ingredient, name: "Butter")
      create(:recipe_ingredient, recipe: recipe, ingredient: flour, unit: "gram", value: 250.0)
      create(:recipe_ingredient, recipe: recipe, ingredient: butter, unit: "arbitrary", value: nil, text: "a knob")

      get "/api/v1/export"

      exported = response.parsed_body["recipes"].first
      expect(exported).to include(
        "name" => "Shortbread",
        "source" => "book",
        "book_title" => "The Cookbook",
        "book_page" => 42,
        "tags" => ["dessert"],
        "rating" => 4,
        "notes" => "chill it",
        "duration" => "30m"
      )
      expect(exported["ingredients"].map { |i| i["name"] }).to eq(["Butter", "Flour"])
      expect(exported["ingredients"].map { |i| i["quantity"] }).to eq([
        {"unit" => "arbitrary", "text" => "a knob"},
        {"unit" => "gram", "value" => 250.0}
      ])
    end

    it "dumps meal plans with recipe-backed and untracked meals" do
      plan = create(:mealplan, name: "Week 1")
      recipe = create(:recipe, name: "Shortbread")
      create(:mealplan_meal, mealplan: plan, recipe: recipe, section: "snacks", is_cooked: true)
      create(:mealplan_meal, :untracked, mealplan: plan, untracked_meal_name: "Leftovers", section: nil)

      get "/api/v1/export"

      meals = response.parsed_body["meal_plans"].first["meals"]
      expect(meals.first).to include("recipe" => "Shortbread", "section" => "snacks", "is_cooked" => true)
      expect(meals.first).not_to have_key("untracked_meal_name")
      expect(meals.last).to include("untracked_meal_name" => "Leftovers", "is_cooked" => false)
      expect(meals.last).not_to have_key("recipe")
    end

    it "flattens an item's quantities into one row each, tagged with the source recipe" do
      list = create(:shoppinglist, name: "Saturday")
      flour = create(:ingredient, name: "Flour")
      recipe = create(:recipe, name: "Shortbread")
      item = create(:shoppinglist_item, shoppinglist: list, ingredient: flour, in_basket: true, note: "plain")
      create(:shoppinglist_quantity, shoppinglist_item: item, unit: "gram", value: 500.0, recipe: recipe)
      create(:shoppinglist_quantity, shoppinglist_item: item, unit: "cup", value: 1.0, recipe: nil)

      get "/api/v1/export"

      items = response.parsed_body["shoppinglists"].first["items"]
      expect(items.size).to eq(2)
      expect(items).to all(include("ingredient" => "Flour", "in_basket" => true, "note" => "plain"))
      expect(items.first).to include("quantity" => {"unit" => "gram", "value" => 500.0}, "from_recipe" => "Shortbread")
      expect(items.last).to include("quantity" => {"unit" => "cup", "value" => 1.0}, "from_recipe" => nil)
    end

    it "keeps a shoppinglist item that has no quantities left" do
      list = create(:shoppinglist)
      create(:shoppinglist_item, shoppinglist: list, ingredient: create(:ingredient, name: "Flour"))

      get "/api/v1/export"

      items = response.parsed_body["shoppinglists"].first["items"]
      expect(items).to match([hash_including("ingredient" => "Flour", "quantity" => {"unit" => "arbitrary"})])
    end

    it "only dumps data belonging to the signed-in user's group" do
      create(:aisle, name: "mine")
      other_group = create(:group)
      create(:aisle, name: "theirs", group: other_group)

      get "/api/v1/export"

      expect(response.parsed_body["aisles"].map { |a| a["name"] }).to eq(["mine"])
    end

    it "produces a dump the importer accepts unchanged" do
      aisle = create(:aisle, name: "dairy", order: 1)
      butter = create(:ingredient, name: "Butter", tags: ["spread"], aisle: aisle)
      recipe = create(:recipe, name: "Shortbread", tags: ["dessert"], rating: 4)
      create(:recipe_ingredient, recipe: recipe, ingredient: butter, unit: "gram", value: 125.0)
      plan = create(:mealplan, name: "Week 1")
      create(:mealplan_meal, mealplan: plan, recipe: recipe, section: "snacks")
      list = create(:shoppinglist, name: "Saturday")
      item = create(:shoppinglist_item, shoppinglist: list, ingredient: butter, note: "unsalted")
      create(:shoppinglist_quantity, shoppinglist_item: item, unit: "gram", value: 200.0, recipe: recipe)

      get "/api/v1/export"
      dump = response.body

      post "/api/v1/import", params: dump, headers: {"Content-Type" => "application/json"}
      expect(response).to have_http_status(:success)

      get "/api/v1/export"
      expect(response.parsed_body).to eq(JSON.parse(dump))
    end
  end

  it "requires a signed-in user" do
    delete "/auth/session"

    get "/api/v1/export"

    expect(response).to have_http_status(:unauthorized)
  end
end
