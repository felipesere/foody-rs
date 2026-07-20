class Ingredient < ApplicationRecord
  include GroupScoped

  belongs_to :aisle, optional: true
  belongs_to :storage, class_name: "StorageLocation", optional: true

  has_many :recipe_ingredients, dependent: :restrict_with_exception
  has_many :shoppinglist_items, dependent: :restrict_with_exception

  validates :name, presence: true

  def self.all_tags
    pluck(:tags).flatten.uniq.sort
  end

  # Fold the given ingredients into this one: repoint everything that referenced
  # a source to this ingredient, then delete the sources. Where the target is
  # already present alongside a source (the unique (recipe|list, ingredient)
  # indexes), the source's row is dropped rather than duplicated — its
  # shoppinglist quantities are moved onto the surviving item so nothing is lost.
  def merge!(source_ingredients)
    source_ingredients = Array(source_ingredients).reject { |source_ingredient| source_ingredient.id == id }

    transaction do
      source_ingredients.each do |source_ingredient|
        absorb_recipe_ingredients(source_ingredient)
        absorb_shoppinglist_items(source_ingredient)
        source_ingredient.destroy!
      end
    end

    self
  end

  private

  def absorb_recipe_ingredients(source_ingredient)
    source_ingredient.recipe_ingredients.find_each do |ri|
      if RecipeIngredient.exists?(recipe_id: ri.recipe_id, ingredient_id: id)
        ri.destroy!
      else
        ri.update!(ingredient_id: id)
      end
    end
  end

  def absorb_shoppinglist_items(source_ingredient)
    source_ingredient.shoppinglist_items.find_each do |item|
      existing = ShoppinglistItem.find_by(shoppinglist_id: item.shoppinglist_id, ingredient_id: id)
      if existing
        item.shoppinglist_quantities.update_all(shoppinglist_item_id: existing.id)
        item.destroy!
      else
        item.update!(ingredient_id: id)
      end
    end
  end
end
