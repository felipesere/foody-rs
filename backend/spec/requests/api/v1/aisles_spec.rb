require "rails_helper"

RSpec.describe "Api::V1::Aisles", type: :request do
  describe "GET /" do
    it "returns all aisles" do
      Aisle.create!(name: "Aisle 1", order: 3)
      Aisle.create!(name: "Aisle 2", order: 1)

      get "/api/v1/aisles"

      expect(response.parsed_body["aisles"].length).to eq(2)
    end
  end

  describe "POST /" do
    it "creates a new aisle" do
      post "/api/v1/aisles", params: {name: "Frozen", order: 2}, as: :json
      expect(response).to have_http_status(:success)
      post "/api/v1/aisles", params: {name: "Veg", order: 1}, as: :json
      expect(response).to have_http_status(:success)

      get "/api/v1/aisles"
      json = response.parsed_body
      expect(json["aisles"]).to eq([{"id" => 2, "name" => "Veg", "order" => 1}, {"id" => 1, "name" => "Frozen", "order" => 2}])
    end
  end

  describe "POST / without order" do
    it "defaults to 1 when no aisles exist yet" do
      post "/api/v1/aisles", params: {aisle: {name: "Frozen"}}, as: :json
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include("name" => "Frozen", "order" => 1)
    end

    it "defaults to one past the current max" do
      Aisle.create!(name: "A", order: 3)
      Aisle.create!(name: "B", order: 7)

      post "/api/v1/aisles", params: {aisle: {name: "C"}}, as: :json
      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to include("name" => "C", "order" => 8)
    end
  end

  describe "PUT /:id" do
    it "updates an aisle" do
      aisle = Aisle.create!(name: "X", order: 1)

      put "/api/v1/aisles/#{aisle.id}", params: {name: "frozen"}, as: :json
      expect(response).to have_http_status(:success)

      aisle.reload
      expect(aisle.name).to eq("frozen")
    end
  end

  describe "PUT /reorder" do
    it "swaps two aisles' orders despite the unique index" do
      a = Aisle.create!(name: "A", order: 1)
      b = Aisle.create!(name: "B", order: 2)

      put "/api/v1/aisles/reorder", params: {aisles: [{id: a.id, order: 2}, {id: b.id, order: 1}]}, as: :json

      expect(response).to have_http_status(:success)
      expect(a.reload.order).to eq(2)
      expect(b.reload.order).to eq(1)
    end

    it "honours the exact order values from the client, gaps included" do
      a = Aisle.create!(name: "A", order: 1)
      b = Aisle.create!(name: "B", order: 2)

      put "/api/v1/aisles/reorder", params: {aisles: [{id: a.id, order: 10}, {id: b.id, order: 5}]}, as: :json

      expect(response).to have_http_status(:success)
      expect(a.reload.order).to eq(10)
      expect(b.reload.order).to eq(5)
      expect(response.parsed_body["aisles"]).to eq([
        {"id" => b.id, "name" => "B", "order" => 5},
        {"id" => a.id, "name" => "A", "order" => 10}
      ])
    end

    it "rejects a list that does not cover every aisle" do
      a = Aisle.create!(name: "A", order: 1)
      Aisle.create!(name: "B", order: 2)

      put "/api/v1/aisles/reorder", params: {aisles: [{id: a.id, order: 1}]}, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(a.reload.order).to eq(1)
    end

    it "rejects duplicate order values" do
      a = Aisle.create!(name: "A", order: 1)
      b = Aisle.create!(name: "B", order: 2)

      put "/api/v1/aisles/reorder", params: {aisles: [{id: a.id, order: 3}, {id: b.id, order: 3}]}, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(a.reload.order).to eq(1)
      expect(b.reload.order).to eq(2)
    end
  end

  describe "DELETE /:id" do
    it "deletes an aisle" do
      aisle = Aisle.create!(name: "X", order: 1)

      delete "/api/v1/aisles/#{aisle.id}"
      expect(response).to have_http_status(:success)

      expect(Aisle.find_by(id: aisle.id)).to be_nil
    end
  end
end
