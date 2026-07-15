class CreateRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :recipes do |t|
      t.string :name, null: false
      t.string :source, null: false
      t.string :book_title
      t.integer :book_page
      t.string :website_url
      t.json :tags, default: []
      t.integer :rating, default: 0, null: false
      t.text :notes, default: "", null: false
      t.string :duration

      t.timestamps
    end
  end
end
