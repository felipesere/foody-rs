class Api::V1::ShoppinglistRecipesController < ApplicationController
  def create
    list = Current.group.shoppinglists.find(params[:shoppinglist_id])
    recipe = Current.group.recipes.find(params[:id])

    ActiveRecord::Base.transaction do
      recipe.recipe_ingredients.each do |ri|
        item = list.shoppinglist_items
                   .find_or_create_by!(ingredient_id: ri.ingredient_id)
        item.shoppinglist_quantities.create!(
          unit:      ri.unit,
          value:     ri.value,
          text:      ri.text,
          recipe_id: recipe.id
        )
      end
    end

    head :no_content
  end

  def destroy
    list = Current.group.shoppinglists.find(params[:shoppinglist_id])

    ActiveRecord::Base.transaction do
      ShoppinglistQuantity
        .joins(:shoppinglist_item)
        .where(recipe_id: params[:id], shoppinglist_items: { shoppinglist_id: list.id })
        .destroy_all

      list.shoppinglist_items
          .left_joins(:shoppinglist_quantities)
          .where(shoppinglist_quantities: { id: nil })
          .destroy_all
    end

    head :no_content
  end
end
