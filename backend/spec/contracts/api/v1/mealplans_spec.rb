require "rails_helper"
require Rails.root.join("spec/support/fixture_writer").to_s

RSpec.describe "api/v1/mealplans contract", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  around { |example| travel_to(Time.zone.local(2026, 1, 1, 12, 0, 0)) { example.run } }

  it "matches mealplans/show.json" do
    recipe = create(:recipe, name: "Apple Pie")
    plan = create(:mealplan, name: "Week 1")

    create(:mealplan_meal,
      mealplan:  plan,
      recipe:    recipe,
      section:   "dinner",
      is_cooked: false
    )
    create(:mealplan_meal, :untracked,
      mealplan:            plan,
      untracked_meal_name: "Leftovers",
      section:             "lunch",
      is_cooked:           true
    )

    get "/api/v1/mealplans/#{plan.id}"

    expect(response).to have_http_status(:ok)
    FixtureWriter.assert_or_write("mealplans/show", response.body)
  end
end
