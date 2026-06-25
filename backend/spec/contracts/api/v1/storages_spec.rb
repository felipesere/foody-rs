require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/storages contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches storages/index.json" do
    create(:storage_location, name: "Fridge",  order: 1)
    create(:storage_location, name: "Freezer", order: 2)
    create(:storage_location, name: "Pantry",  order: 3)

    get "/api/v1/storages"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("storages/index", response.body)
  end
end
