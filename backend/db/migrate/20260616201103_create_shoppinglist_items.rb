class CreateShoppinglistItems < ActiveRecord::Migration[8.1]
  def change
    create_table :shoppinglist_items do |t|
      t.references :shoppinglist, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.boolean :in_basket, null: false, default: false
      t.text :note

      t.timestamps
    end

    add_index :shoppinglist_items, [:shoppinglist_id, :ingredient_id], unique: true
  end
end
