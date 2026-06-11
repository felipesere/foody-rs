class CreateIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :ingredients do |t|
      t.string :name
      t.references :aisle, null: true, foreign_key: true
      t.json :tags, default: []

      t.timestamps
    end
  end
end
