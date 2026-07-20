require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/shoppinglists contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches shoppinglists/show.json" do
    aisle = create(:aisle, name: "Produce", order: 1)
    apples = create(:ingredient, name: "Apples", aisle: aisle, tags: ["fruit"])
    flour = create(:ingredient, name: "Flour", aisle: aisle, tags: [])
    recipe = create(:recipe, name: "Apple Pie")

    list = create(:shoppinglist, name: "Saturday shop")

    apple_item = create(:shoppinglist_item,
      shoppinglist: list,
      ingredient: apples,
      in_basket: false,
      note: "ripe ones")
    create(:shoppinglist_quantity,
      shoppinglist_item: apple_item,
      unit: "gram",
      value: 500.0,
      recipe: recipe)

    flour_item = create(:shoppinglist_item,
      shoppinglist: list,
      ingredient: flour,
      in_basket: true)
    create(:shoppinglist_quantity,
      shoppinglist_item: flour_item,
      unit: "gram",
      value: 300.0)

    get "/api/v1/shoppinglists/#{list.id}"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("shoppinglists/show", response.body)
  end

  it "matches shoppinglists/index.json" do
    create(:shoppinglist, name: "This week")
    create(:shoppinglist, name: "Last week")

    get "/api/v1/shoppinglists"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("shoppinglists/index", response.body)
  end
end
