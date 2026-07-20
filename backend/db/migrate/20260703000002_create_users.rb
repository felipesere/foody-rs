class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :name
      t.string :oidc_subject
      t.references :group, null: false, foreign_key: true

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :oidc_subject, unique: true
  end
end
