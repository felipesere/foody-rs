class Api::V1::ShoppinglistItemsController < ApplicationController
  def create
    list = Current.group.shoppinglists.find(params[:shoppinglist_id])
    item = list.shoppinglist_items.new(ingredient_id: params[:ingredient_id])
    item.shoppinglist_quantities.build(
      **ShoppinglistQuantity.from_quantity_string(params[:quantity].to_s)
    )

    if item.save
      render json: Payloads.shoppinglist_item(item), status: :created
    else
      render json: {errors: item.errors.full_messages}, status: :unprocessable_content
    end
  end

  def update
    item = find_item
    if item.update(item_params)
      render json: Payloads.shoppinglist_item(item)
    else
      render json: {errors: item.errors.full_messages}, status: :unprocessable_content
    end
  end

  def destroy
    find_item.destroy
    head :no_content
  end

  private

  def find_item
    Current.group.shoppinglists
      .find(params[:shoppinglist_id])
      .shoppinglist_items.find(params[:id])
  end

  def item_params
    params.permit(:in_basket, :note)
  end
end
