class Api::V1::StoragesController < ApplicationController

  def index
    storages = Current.group.storage_locations.order(order: :asc)
    render json: {
      storages: storages.map { |s| Payloads.storage(s) }
    }
  end

  def create
    storage = Current.group.storage_locations.new(storage_params)
    if storage.save
      render json: Payloads.storage(storage), status: :created
    else
      render json: { errors: storage.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    storage = Current.group.storage_locations.find_by(id: params["id"])
    if storage.update(storage_params)
      render json: Payloads.storage(storage), status: :ok
    else
      render status: :unprocessable_content
    end
  end

  def destroy
    @storage = Current.group.storage_locations.find(params[:id])
    @storage.destroy

    head :no_content
  end

  private

  def storage_params
    params.expect(storage: [:name, :order])
  end
end
