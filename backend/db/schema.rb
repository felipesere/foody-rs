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

ActiveRecord::Schema[8.1].define(version: 2026_06_16_223047) do
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

  create_table "mealplan_meals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "is_cooked", default: false, null: false
    t.integer "mealplan_id", null: false
    t.integer "recipe_id"
    t.string "section"
    t.string "untracked_meal_name"
    t.datetime "updated_at", null: false
    t.index ["mealplan_id"], name: "index_mealplan_meals_on_mealplan_id"
    t.index ["recipe_id"], name: "index_mealplan_meals_on_recipe_id"
  end

  create_table "mealplans", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "recipe_ingredients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "ingredient_id", null: false
    t.integer "recipe_id", null: false
    t.string "text"
    t.string "unit", null: false
    t.datetime "updated_at", null: false
    t.float "value"
    t.index ["ingredient_id"], name: "index_recipe_ingredients_on_ingredient_id"
    t.index ["recipe_id", "ingredient_id"], name: "index_recipe_ingredients_on_recipe_id_and_ingredient_id", unique: true
    t.index ["recipe_id"], name: "index_recipe_ingredients_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.integer "book_page"
    t.string "book_title"
    t.datetime "created_at", null: false
    t.string "duration"
    t.string "name", null: false
    t.text "notes", default: "", null: false
    t.integer "rating", default: 0, null: false
    t.string "source", null: false
    t.json "tags", default: []
    t.datetime "updated_at", null: false
    t.string "website_url"
  end

  create_table "shoppinglist_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "in_basket", default: false, null: false
    t.integer "ingredient_id", null: false
    t.text "note"
    t.integer "shoppinglist_id", null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_shoppinglist_items_on_ingredient_id"
    t.index ["shoppinglist_id", "ingredient_id"], name: "index_shoppinglist_items_on_shoppinglist_id_and_ingredient_id", unique: true
    t.index ["shoppinglist_id"], name: "index_shoppinglist_items_on_shoppinglist_id"
  end

  create_table "shoppinglist_quantities", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "recipe_id"
    t.integer "shoppinglist_item_id", null: false
    t.string "text"
    t.string "unit", null: false
    t.datetime "updated_at", null: false
    t.float "value"
    t.index ["recipe_id"], name: "index_shoppinglist_quantities_on_recipe_id"
    t.index ["shoppinglist_item_id"], name: "index_shoppinglist_quantities_on_shoppinglist_item_id"
  end

  create_table "shoppinglists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "ingredients", "aisles"
  add_foreign_key "mealplan_meals", "mealplans"
  add_foreign_key "mealplan_meals", "recipes"
  add_foreign_key "recipe_ingredients", "ingredients"
  add_foreign_key "recipe_ingredients", "recipes"
  add_foreign_key "shoppinglist_items", "ingredients"
  add_foreign_key "shoppinglist_items", "shoppinglists"
  add_foreign_key "shoppinglist_quantities", "recipes"
  add_foreign_key "shoppinglist_quantities", "shoppinglist_items"
end
