class CreateStorageLocations < ActiveRecord::Migration[8.1]
  def change
    create_table :storage_locations do |t|
      t.string :name
      t.integer :order

      t.timestamps
    end
    add_index :storage_locations, :name, unique: true
    add_index :storage_locations, :order, unique: true
  end
end
