class RecipeSerializer
  def initialize(recipe)
    @recipe = recipe
  end

  def as_json(*)
    {
      id:       @recipe.id,
      name:     @recipe.name,
      source:   @recipe.source,
      url:      @recipe.website_url,
      title:    @recipe.book_title,
      page:     @recipe.book_page,
      tags:     @recipe.tags,
      rating:   @recipe.rating,
      notes:    @recipe.notes,
      duration: @recipe.duration,
      ingredients: sorted_recipe_ingredients.map { |ri| ingredient_with_quantity(ri) }
    }
  end

  private

  def sorted_recipe_ingredients
    @recipe.recipe_ingredients.sort_by { |ri| ri.ingredient.name }
  end

  def ingredient_with_quantity(recipe_ingredient)
    {
      ingredient: ingredient_payload(recipe_ingredient.ingredient),
      quantity: [
        {
          id:    recipe_ingredient.id,
          unit:  recipe_ingredient.unit,
          value: recipe_ingredient.value,
          text:  recipe_ingredient.text
        }
      ]
    }
  end

  def ingredient_payload(ingredient)
    {
      id:   ingredient.id,
      name: ingredient.name,
      tags: ingredient.tags || [],
      aisle: ingredient.aisle && {
        id:    ingredient.aisle.id,
        name:  ingredient.aisle.name,
        order: ingredient.aisle.order
      }
    }
  end
end
