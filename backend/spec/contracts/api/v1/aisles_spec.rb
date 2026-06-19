require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/aisles contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches aisles/index.json" do
    create(:aisle, name: "Produce", order: 1)
    create(:aisle, name: "Bakery",  order: 2)
    create(:aisle, name: "Dairy",   order: 3)

    get "/api/v1/aisles"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("aisles/index", response.body)
  end
end
