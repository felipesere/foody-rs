class AddGroupScoping < ActiveRecord::Migration[8.1]
  OWNED_TABLES = %i[
    recipes
    recipe_ingredients
    shoppinglists
    shoppinglist_items
    shoppinglist_quantities
    mealplans
    mealplan_meals
    ingredients
    aisles
    storage_locations
  ].freeze

  def change
    OWNED_TABLES.each do |table|
      add_reference table, :group, null: false, foreign_key: true, index: true
    end

    # Catalogs are per-group, so their name/order uniqueness must be scoped to
    # the group rather than global.
    %i[aisles storage_locations].each do |table|
      remove_index table, :name
      remove_index table, :order
      add_index table, [:group_id, :name], unique: true
      add_index table, [:group_id, :order], unique: true
    end
  end
end
