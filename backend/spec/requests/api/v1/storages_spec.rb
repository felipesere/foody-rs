require 'rails_helper'

RSpec.describe "Api::V1::Storages", type: :request do
  describe "GET /" do
    it "returns all storage locations" do
      StorageLocation.create!(name: "Fridge",  order: 3)
      StorageLocation.create!(name: "Freezer", order: 1)

      get "/api/v1/storages"

      expect(response.parsed_body["storages"].length).to eq(2)
    end
  end

  describe "POST /" do
    it "creates a new storage location" do
      post "/api/v1/storages", params: { name: "Freezer", order: 2 }, as: :json
      expect(response).to have_http_status(:success)
      post "/api/v1/storages", params: { name: "Pantry", order: 1 }, as: :json
      expect(response).to have_http_status(:success)

      get "/api/v1/storages"
      json = response.parsed_body
      expect(json["storages"]).to eq([{"id" => 2, "name" => "Pantry", "order" => 1}, {"id" => 1, "name" => "Freezer", "order" => 2}])
    end
  end

  describe "POST / without order" do
    it "defaults to 1 when no storage locations exist yet" do
      post "/api/v1/storages", params: { storage: { name: "Freezer" } }, as: :json
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include("name" => "Freezer", "order" => 1)
    end

    it "defaults to one past the current max" do
      StorageLocation.create!(name: "A", order: 3)
      StorageLocation.create!(name: "B", order: 7)

      post "/api/v1/storages", params: { storage: { name: "C" } }, as: :json
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include("name" => "C", "order" => 8)
    end
  end

  describe "PUT /:id" do
    it "updates a storage location" do
      storage = StorageLocation.create!(name: "X", order: 1)

      put "/api/v1/storages/#{storage.id}", params: { name: "fridge" }, as: :json
      expect(response).to have_http_status(:success)

      storage.reload
      expect(storage.name).to eq("fridge")
    end
  end

  describe "DELETE /:id" do
    it "deletes a storage location" do
      storage = StorageLocation.create!(name: "X", order: 1)

      delete "/api/v1/storages/#{storage.id}"
      expect(response).to have_http_status(:success)

      expect(StorageLocation.find_by(id: storage.id)).to be_nil
    end
  end
end
