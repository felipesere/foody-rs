# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_06_11_201644) do
  create_table "aisles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "order"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_aisles_on_name", unique: true
    t.index ["order"], name: "index_aisles_on_order", unique: true
  end

  create_table "articles", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "ingredients", force: :cascade do |t|
    t.integer "aisle_id"
    t.datetime "created_at", null: false
    t.string "name"
    t.json "tags", default: []
    t.datetime "updated_at", null: false
    t.index ["aisle_id"], name: "index_ingredients_on_aisle_id"
  end

  add_foreign_key "ingredients", "aisles"
end
