class CreateRecipeIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :recipe_ingredients do |t|
      t.references :recipe, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.string :unit, null: false
      t.float :value
      t.string :text

      t.timestamps
    end

    add_index :recipe_ingredients, [:recipe_id, :ingredient_id], unique: true
  end
end
