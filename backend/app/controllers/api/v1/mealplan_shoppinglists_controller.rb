class Api::V1::MealplanShoppinglistsController < ApplicationController
  def create
    plan = Current.group.mealplans.find(params[:mealplan_id])
    list = Current.group.shoppinglists.find(params[:id])

    already_attached = ShoppinglistQuantity
                       .joins(:shoppinglist_item)
                       .where(shoppinglist_items: { shoppinglist_id: list.id })
                       .where.not(recipe_id: nil)
                       .distinct
                       .pluck(:recipe_id)

    recipes_to_add = plan.mealplan_meals
                         .where(is_cooked: false)
                         .where.not(recipe_id: nil)
                         .where.not(recipe_id: already_attached)
                         .pluck(:recipe_id)
                         .uniq

    ActiveRecord::Base.transaction do
      Current.group.recipes.where(id: recipes_to_add).includes(:recipe_ingredients).each do |recipe|
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
    end

    head :no_content
  end
end
