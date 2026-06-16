class CreateMealplans < ActiveRecord::Migration[8.1]
  def change
    create_table :mealplans do |t|
      t.string :name, null: false

      t.timestamps
    end
  end
end
