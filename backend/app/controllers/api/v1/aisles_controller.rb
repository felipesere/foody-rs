class Api::V1::AislesController < ApplicationController
  # Temporary orders are parked well below any real value so phase one can't
  # collide with the finals we write in phase two.
  PARK_OFFSET = -1_000_000

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
      render json: {errors: aisle.errors.full_messages}, status: :unprocessable_content
    end
  end

  def update
    aisle = Current.group.aisles.find_by(id: params["id"])
    if aisle.update(aisle_params)
      render json: Payloads.aisle(aisle), status: :ok
    else
      render status: :unprocessable_content
    end
  end

  # Applies a new `order` to every aisle in one shot. The unique
  # (group_id, order) index means we can't write a permutation one row at a
  # time — any single write would momentarily collide with the row that still
  # holds that value. So we do it in one transaction, first parking every row
  # at a distinct out-of-range value (which can't clash with the finals or with
  # each other) before writing the orders the client actually asked for.
  def reorder
    updates = params.expect(aisles: [[:id, :order]])
    aisles = Current.group.aisles.index_by(&:id)

    ids = updates.map { |u| u[:id].to_i }
    orders = updates.map { |u| u[:order].to_i }

    if ids.sort != aisles.keys.sort
      return render json: {errors: ["aisles must list every aisle exactly once"]}, status: :unprocessable_content
    end
    if orders.uniq.length != orders.length
      return render json: {errors: ["order values must be unique"]}, status: :unprocessable_content
    end

    Aisle.transaction do
      updates.each_with_index { |u, i| aisles.fetch(u[:id].to_i).update!(order: PARK_OFFSET - i) }
      updates.each { |u| aisles.fetch(u[:id].to_i).update!(order: u[:order].to_i) }
    end

    render json: {
      aisles: Current.group.aisles.order(order: :asc).map { |a| Payloads.aisle(a) }
    }
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
