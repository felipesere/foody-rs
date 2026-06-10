class Api::V1::AislesController < ApplicationController

  def index
    aisles = Aisle.all.order(order: :asc)
    render json: {
      aisles: aisles.as_json(only: [:name, :order, :id])
    }
  end

  def create
    aisle = Aisle.new(aisle_params)
    if aisle.save
      render json: aisle, status: :created
    else
      render json: { errors: aisle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    aisle = Aisle.find_by(id: params["id"])
    if aisle.update(aisle_params)
      render json: aisle, status: :ok
    else
      render status: :unprocessable_entity
    end
  end

  def destroy
    @aisle = Aisle.find(params[:id])
    @aisle.destroy

    head :no_content
  end

  private

  def aisle_params
    params.expect(aisle: [:name, :order])
  end
end
