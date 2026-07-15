require "rails_helper"

RSpec.describe "Api::V1::Me", type: :request do
  describe "GET /api/v1/me" do
    it "returns the signed-in user and their group" do
      get "/api/v1/me"

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(
        "kind" => "user",
        "id" => Integer,
        "name" => "Test User",
        "email" => "test@example.com",
        "group" => a_hash_including("name" => "Test Group")
      )
    end

    it "returns 401 when there is no valid session" do
      Session.delete_all

      get "/api/v1/me"

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
