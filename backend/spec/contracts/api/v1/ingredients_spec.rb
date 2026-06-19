require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/ingredients contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches ingredients/index.json" do
    aisle = create(:aisle, name: "Produce", order: 1)
    create(:ingredient, name: "Apples", aisle: aisle, tags: ["fruit"])
    create(:ingredient, name: "Flour",  aisle: aisle, tags: [])

    get "/api/v1/ingredients"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("ingredients/index", response.body)
  end
end
