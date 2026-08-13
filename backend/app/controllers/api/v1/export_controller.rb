class Api::V1::ExportController < ApplicationController
  # Dumps everything owned by the current group as the same `version: 1` JSON
  # that ImportController reads back, so an export can be re-imported (into this
  # group or another one) without any conversion. Records are referenced by name
  # rather than id, since ids don't survive a round trip.
  def show
    render json: {
      version: 1,
      aisles: aisles.map { |aisle| export_aisle(aisle) },
      storages: storages.map { |storage| export_storage(storage) },
      ingredients: ingredients.map { |ingredient| export_ingredient(ingredient) },
      recipes: recipes.map { |recipe| export_recipe(recipe) },
      meal_plans: mealplans.map { |mealplan| export_mealplan(mealplan) },
      shoppinglists: shoppinglists.map { |shoppinglist| export_shoppinglist(shoppinglist) }
    }
  end

  private

  def aisles
    Current.group.aisles.order(:order)
  end

  def storages
    Current.group.storage_locations.order(:order)
  end

  def ingredients
    Current.group.ingredients.includes(:aisle, :storage).order(:name)
  end

  def recipes
    Current.group.recipes
      .includes(recipe_ingredients: :ingredient)
      .order(:name)
  end

  def mealplans
    Current.group.mealplans.includes(mealplan_meals: :recipe).order(:name)
  end

  def shoppinglists
    Current.group.shoppinglists
      .includes(shoppinglist_items: [:ingredient, {shoppinglist_quantities: :recipe}])
      .order(:name)
  end

  def export_aisle(aisle)
    {
      name: aisle.name,
      order: aisle.order,
      created_at: Payloads.timestamp(aisle.created_at)
    }
  end

  def export_storage(storage)
    {
      name: storage.name,
      order: storage.order,
      created_at: Payloads.timestamp(storage.created_at)
    }
  end

  def export_ingredient(ingredient)
    {
      name: ingredient.name,
      tags: ingredient.tags || [],
      aisle: ingredient.aisle&.name,
      stored_in: ingredient.storage&.name,
      created_at: Payloads.timestamp(ingredient.created_at)
    }
  end

  def export_recipe(recipe)
    {
      name: recipe.name,
      source: recipe.source,
      book_title: recipe.book_title,
      book_page: recipe.book_page,
      website_url: recipe.website_url,
      tags: recipe.tags || [],
      rating: recipe.rating,
      notes: recipe.notes,
      duration: recipe.duration,
      ingredients: recipe.recipe_ingredients
        .sort_by { |ri| ri.ingredient.name }
        .map { |ri| export_recipe_ingredient(ri) },
      created_at: Payloads.timestamp(recipe.created_at)
    }
  end

  def export_recipe_ingredient(recipe_ingredient)
    {
      name: recipe_ingredient.ingredient.name,
      quantity: export_quantity(recipe_ingredient),
      created_at: Payloads.timestamp(recipe_ingredient.created_at)
    }
  end

  def export_mealplan(mealplan)
    {
      name: mealplan.name,
      meals: mealplan.mealplan_meals.sort_by(&:id).map { |meal| export_meal(meal) },
      created_at: Payloads.timestamp(mealplan.created_at)
    }
  end

  def export_meal(meal)
    {
      recipe: meal.recipe&.name,
      untracked_meal_name: meal.untracked_meal_name,
      section: meal.section,
      is_cooked: meal.is_cooked,
      created_at: Payloads.timestamp(meal.created_at)
    }.compact
  end

  def export_shoppinglist(shoppinglist)
    items = shoppinglist.shoppinglist_items
      .sort_by(&:id)
      .flat_map { |item| export_shoppinglist_item(item) }

    {
      name: shoppinglist.name,
      items: items,
      created_at: Payloads.timestamp(shoppinglist.created_at)
    }
  end

  # The dump format predates items holding several quantities, so it carries one
  # flat row per quantity with the item's fields repeated; the import groups them
  # back together by ingredient. An item whose quantities were all deleted still
  # gets a row (with an empty quantity) so it isn't silently dropped.
  def export_shoppinglist_item(item)
    quantities = item.shoppinglist_quantities.sort_by(&:id)
    return [shoppinglist_item_row(item, nil)] if quantities.empty?

    quantities.map { |quantity| shoppinglist_item_row(item, quantity) }
  end

  def shoppinglist_item_row(item, quantity)
    {
      ingredient: item.ingredient.name,
      quantity: quantity ? export_quantity(quantity) : {unit: "arbitrary"},
      in_basket: item.in_basket,
      from_recipe: quantity&.recipe&.name,
      note: item.note,
      created_at: Payloads.timestamp(quantity&.created_at || item.created_at)
    }
  end

  # `value` and `text` are mutually exclusive in practice; drop whichever is
  # unset so the dump stays close to what the old Rust exporter wrote.
  def export_quantity(record)
    {
      unit: record.unit,
      value: record.value,
      text: record.text
    }.compact
  end
end
