class CreateAisles < ActiveRecord::Migration[8.1]
  def change
    create_table :aisles do |t|
      t.string :name
      t.integer :order

      t.timestamps
    end
    add_index :aisles, :name, unique: true
    add_index :aisles, :order, unique: true
  end
end
