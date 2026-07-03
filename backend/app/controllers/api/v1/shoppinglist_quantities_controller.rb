class Api::V1::ShoppinglistQuantitiesController < ApplicationController
  def create
    item = find_item
    quantity = item.shoppinglist_quantities.new(
      **ShoppinglistQuantity.from_quantity_string(params[:quantity].to_s)
    )

    if quantity.save
      render json: serialize(quantity), status: :created
    else
      render json: { errors: quantity.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    quantity = find_item.shoppinglist_quantities.find(params[:id])
    if quantity.update(**ShoppinglistQuantity.from_quantity_string(params[:quantity].to_s))
      render json: serialize(quantity)
    else
      render json: { errors: quantity.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    find_item.shoppinglist_quantities.find(params[:id]).destroy
    head :no_content
  end

  private

  def find_item
    Current.group.shoppinglists
           .find(params[:shoppinglist_id])
           .shoppinglist_items.find(params[:item_id])
  end

  def serialize(quantity)
    {
      id:        quantity.id,
      unit:      quantity.unit,
      value:     quantity.value,
      text:      quantity.text,
      recipe_id: quantity.recipe_id
    }
  end
end
