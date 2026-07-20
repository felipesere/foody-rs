require "rails_helper"

RSpec.describe "Group scoping", type: :request do
  # The global before(:each) signs in the default user (in "Test Group").
  it "never exposes another group's recipes" do
    mine = create(:recipe, name: "My Stew") # stamped with Current.group
    other_group = create(:group)
    theirs = create(:recipe, name: "Their Stew", group: other_group)

    get "/api/v1/recipes"
    expect(response).to have_http_status(:ok)
    names = response.parsed_body["recipes"].map { |r| r["name"] }
    expect(names).to include("My Stew")
    expect(names).not_to include("Their Stew")

    get "/api/v1/recipes/#{theirs.id}"
    expect(response).to have_http_status(:not_found)

    put "/api/v1/recipes/#{theirs.id}", params: {recipe: {name: "hijacked"}}, as: :json
    expect(response).to have_http_status(:not_found)
    expect(theirs.reload.name).to eq("Their Stew")

    expect(mine).to be_persisted
  end
end
