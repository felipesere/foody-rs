class AddStorageToIngredients < ActiveRecord::Migration[8.1]
  def change
    add_reference :ingredients, :storage, null: true,
      foreign_key: { to_table: :storage_locations }
  end
end
