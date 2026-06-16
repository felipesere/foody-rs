class Api::V1::ShoppinglistsController < ApplicationController
  def index
    lists = Shoppinglist.order(:id)
    render json: {
      shoppinglists: lists.map { |l| ShoppinglistSerializer.new(l, minimal: true).as_json }
    }
  end

  def show
    list = Shoppinglist.with_full_items.find(params[:id])
    render json: ShoppinglistSerializer.new(list).as_json
  end

  def create
    list = Shoppinglist.new(shoppinglist_params)
    if list.save
      render json: ShoppinglistSerializer.new(list).as_json, status: :created
    else
      render json: { errors: list.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    Shoppinglist.find(params[:id]).destroy
    head :no_content
  end

  def clear
    list = Shoppinglist.find(params[:id])
    list.shoppinglist_items.where(in_basket: true).destroy_all
    head :no_content
  end

  private

  def shoppinglist_params
    params.permit(:name)
  end
end
