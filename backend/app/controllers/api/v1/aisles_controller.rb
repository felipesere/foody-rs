class Api::V1::AislesController < ApplicationController

  def index
    aisles = Current.group.aisles.order(order: :asc)
    render json: {
      aisles: aisles.map { |a| Payloads.aisle(a) }
    }
  end

  def create
    aisle = Current.group.aisles.new(aisle_params)
    if aisle.save
      render json: Payloads.aisle(aisle), status: :created
    else
      render json: { errors: aisle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    aisle = Current.group.aisles.find_by(id: params["id"])
    if aisle.update(aisle_params)
      render json: Payloads.aisle(aisle), status: :ok
    else
      render status: :unprocessable_entity
    end
  end

  def destroy
    @aisle = Current.group.aisles.find(params[:id])
    @aisle.destroy

    head :no_content
  end

  private

  def aisle_params
    params.expect(aisle: [:name, :order])
  end
end
