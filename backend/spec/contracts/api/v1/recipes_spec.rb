require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/recipes contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches recipes/show.json" do
    aisle = create(:aisle, name: "Produce", order: 1)
    apples = create(:ingredient, name: "Apples", aisle: aisle, tags: ["fruit"])
    flour  = create(:ingredient, name: "Flour",  aisle: aisle, tags: [])

    recipe = create(:recipe,
      name:       "Apple Pie",
      source:     "book",
      book_title: "Joy of Cooking",
      book_page:  42,
      tags:       ["dessert"],
      rating:     4,
      notes:      "Family favourite",
      duration:   60
    )
    create(:recipe_ingredient, recipe: recipe, ingredient: apples, unit: "gram", value: 500.0)
    create(:recipe_ingredient, recipe: recipe, ingredient: flour,  unit: "gram", value: 300.0, text: "sifted")

    get "/api/v1/recipes/#{recipe.id}"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("recipes/show", response.body)
  end

  it "matches recipes/show--website.json" do
    aisle = create(:aisle, name: "Pantry", order: 1)
    pasta = create(:ingredient, name: "Pasta", aisle: aisle, tags: [])

    recipe = create(:recipe, :website,
      name:        "Weeknight Pasta",
      website_url: "https://example.com/pasta",
      tags:        ["dinner", "quick"],
      rating:      3,
      notes:       "30 minutes flat",
      duration:    30
    )
    create(:recipe_ingredient, recipe: recipe, ingredient: pasta, unit: "gram", value: 200.0)

    get "/api/v1/recipes/#{recipe.id}"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("recipes/show--website", response.body)
  end

end
