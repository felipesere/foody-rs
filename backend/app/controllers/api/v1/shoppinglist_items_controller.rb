class Api::V1::ShoppinglistItemsController < ApplicationController
  def create
    list = Shoppinglist.find(params[:shoppinglist_id])
    item = list.shoppinglist_items.new(ingredient_id: params[:ingredient_id])
    item.shoppinglist_quantities.build(
      **ShoppinglistQuantity.from_quantity_string(params[:quantity].to_s)
    )

    if item.save
      render json: Payloads.shoppinglist_item(item), status: :created
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    item = ShoppinglistItem.where(shoppinglist_id: params[:shoppinglist_id])
                          .find(params[:id])
    if item.update(item_params)
      render json: Payloads.shoppinglist_item(item)
    else
      render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    ShoppinglistItem.where(shoppinglist_id: params[:shoppinglist_id])
                    .find(params[:id])
                    .destroy
    head :no_content
  end

  private

  def item_params
    params.permit(:in_basket, :note)
  end
end
