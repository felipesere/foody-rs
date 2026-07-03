class Api::V1::ImportController < ApplicationController
  def create
    payload = JSON.parse(request.body.read)

    summary = ActiveRecord::Base.transaction do
      aisles      = import_aisles(payload["aisles"])
      ingredients = import_ingredients(payload["ingredients"], aisles)
      recipes     = import_recipes(payload["recipes"], ingredients)
      import_mealplans(payload["meal_plans"], recipes)
      import_shoppinglists(payload["shoppinglists"], ingredients, recipes)

      {
        aisles:        Current.group.aisles.count,
        ingredients:   Current.group.ingredients.count,
        recipes:       Current.group.recipes.count,
        mealplans:     Current.group.mealplans.count,
        shoppinglists: Current.group.shoppinglists.count
      }
    end

    render json: { imported: summary }
  rescue JSON::ParserError => e
    render json: { errors: ["invalid JSON: #{e.message}"] }, status: :bad_request
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [import_error_message(e)] }, status: :unprocessable_content
  end

  private

  def import_error_message(e)
    record = e.record
    context = {
      recipe:       record.is_a?(Recipe)       ? record.name : record.try(:recipe)&.name,
      ingredient:   record.is_a?(Ingredient)   ? record.name : record.try(:ingredient)&.name,
      shoppinglist: record.is_a?(Shoppinglist) ? record.name : record.try(:shoppinglist)&.name,
      mealplan:     record.is_a?(Mealplan)     ? record.name : record.try(:mealplan)&.name
    }.compact
    context.empty? ? e.message : "#{e.message} (#{context.map { |k, v| "#{k}: #{v}" }.join(', ')})"
  end

  def stamp(record, ts)
    return unless ts
    record.created_at = ts
    record.updated_at = ts
  end

  def timestamps(ts)
    ts ? { created_at: ts, updated_at: ts } : {}
  end

  def import_aisles(rows)
    Array(rows).each_with_object({}) do |attrs, map|
      aisle = Current.group.aisles.find_or_initialize_by(name: attrs["name"])
      aisle.order = attrs["order"]
      stamp(aisle, attrs["created_at"])
      aisle.save!
      map[aisle.name] = aisle
    end
  end

  def import_ingredients(rows, aisles)
    Array(rows).each_with_object({}) do |attrs, map|
      ingredient = Current.group.ingredients.find_or_initialize_by(name: attrs["name"])
      ingredient.tags  = attrs["tags"] || []
      ingredient.aisle = aisles[attrs["aisle"]]
      stamp(ingredient, attrs["created_at"])
      ingredient.save!
      map[ingredient.name] = ingredient
    end
  end

  def import_recipes(rows, ingredients)
    Array(rows).each_with_object({}) do |attrs, map|
      recipe = Current.group.recipes.find_or_initialize_by(name: attrs["name"])
      book_title = attrs["book_title"]
      book_title = "No book" if attrs["source"] == "book" && book_title == ""
      recipe.assign_attributes(
        source:      attrs["source"],
        book_title:  book_title,
        book_page:   attrs["book_page"],
        website_url: attrs["website_url"],
        tags:        attrs["tags"] || [],
        rating:      attrs["rating"] || 0,
        notes:       attrs["notes"] || "",
        duration:    attrs["duration"]
      )
      stamp(recipe, attrs["created_at"])
      recipe.save!
      recipe.recipe_ingredients.destroy_all

      Array(attrs["ingredients"]).each do |ri|
        ingredient = ingredients[ri["name"]] ||
                     Current.group.ingredients.find_or_create_by!(name: ri["name"]).tap { |i| ingredients[i.name] = i }
        quantity = ri["quantity"] || {}
        recipe_ingredient = recipe.recipe_ingredients.find_or_initialize_by(ingredient: ingredient)
        recipe_ingredient.assign_attributes(
          unit:  quantity["unit"] || "arbitrary",
          value: quantity["value"],
          text:  quantity["text"]
        )
        stamp(recipe_ingredient, ri["created_at"])
        recipe_ingredient.save!
      end

      map[recipe.name] = recipe
    end
  end

  def import_mealplans(rows, recipes)
    Array(rows).each do |attrs|
      plan = Current.group.mealplans.find_or_initialize_by(name: attrs["name"])
      stamp(plan, attrs["created_at"])
      plan.save!
      plan.mealplan_meals.destroy_all

      Array(attrs["meals"]).each do |meal|
        recipe = recipes[meal["recipe"]] if meal["recipe"]
        next if recipe.nil? && meal["untracked_meal_name"].blank?

        plan.mealplan_meals.create!(
          recipe:              recipe,
          untracked_meal_name: recipe ? nil : meal["untracked_meal_name"],
          section:             meal["section"],
          is_cooked:           meal.fetch("is_cooked", false),
          **timestamps(meal["created_at"])
        )
      end
    end
  end

  def import_shoppinglists(rows, ingredients, recipes)
    Array(rows).each do |attrs|
      list = Current.group.shoppinglists.find_or_initialize_by(name: attrs["name"])
      stamp(list, attrs["created_at"])
      list.save!
      list.shoppinglist_items.destroy_all

      Array(attrs["items"]).group_by { |i| i["ingredient"] }.each do |ingredient_name, item_rows|
        ingredient = ingredients[ingredient_name] ||
                     Current.group.ingredients.find_or_create_by!(name: ingredient_name)
                            .tap { |i| ingredients[i.name] = i }

        item_ts = item_rows.map { |r| r["created_at"] }.compact.min
        item = list.shoppinglist_items.create!(
          ingredient: ingredient,
          in_basket:  item_rows.any? { |r| r["in_basket"] },
          note:       item_rows.map { |r| r["note"] }.compact.first,
          **timestamps(item_ts)
        )

        item_rows.each do |row|
          quantity = row["quantity"] || {}
          item.shoppinglist_quantities.create!(
            recipe:     recipes[row["from_recipe"]],
            unit:       quantity["unit"] || "arbitrary",
            value:      quantity["value"],
            text:       quantity["text"],
            **timestamps(row["created_at"])
          )
        end
      end
    end
  end
end
