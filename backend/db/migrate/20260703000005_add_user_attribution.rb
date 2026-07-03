class AddUserAttribution < ActiveRecord::Migration[8.1]
  ATTRIBUTED_TABLES = %i[
    recipes
    shoppinglists
    shoppinglist_items
    mealplans
    mealplan_meals
  ].freeze

  def change
    ATTRIBUTED_TABLES.each do |table|
      add_reference table, :created_by, foreign_key: { to_table: :users }, null: false
      add_reference table, :updated_by, foreign_key: { to_table: :users }, null: false
    end
  end
end
