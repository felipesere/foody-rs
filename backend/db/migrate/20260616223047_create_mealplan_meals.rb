class CreateMealplanMeals < ActiveRecord::Migration[8.1]
  def change
    create_table :mealplan_meals do |t|
      t.references :mealplan, null: false, foreign_key: true
      t.references :recipe, foreign_key: true
      t.string :untracked_meal_name
      t.string :section
      t.boolean :is_cooked, null: false, default: false

      t.timestamps
    end
  end
end
