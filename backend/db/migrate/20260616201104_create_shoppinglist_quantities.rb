class CreateShoppinglistQuantities < ActiveRecord::Migration[8.1]
  def change
    create_table :shoppinglist_quantities do |t|
      t.references :shoppinglist_item, null: false, foreign_key: true
      t.references :recipe, foreign_key: true
      t.string :unit,  null: false
      t.float  :value
      t.string :text

      t.timestamps
    end
  end
end
