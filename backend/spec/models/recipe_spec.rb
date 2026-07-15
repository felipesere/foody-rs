require "rails_helper"

RSpec.describe Recipe, type: :model do
  describe "validations" do
    it "requires a name" do
      recipe = build(:recipe, name: nil)
      expect(recipe).not_to be_valid
      expect(recipe.errors[:name]).to include("can't be blank")
    end

    it "rejects an unknown source" do
      recipe = build(:recipe, source: "magazine")
      expect(recipe).not_to be_valid
      expect(recipe.errors[:source]).to be_present
    end

    context "when source is 'book'" do
      it "requires book_title and book_page" do
        recipe = build(:recipe, source: "book", book_title: nil, book_page: nil)
        expect(recipe).not_to be_valid
        expect(recipe.errors[:book_title]).to be_present
        expect(recipe.errors[:book_page]).to be_present
      end

      it "does not require website_url" do
        recipe = build(:recipe, source: "book", website_url: nil)
        expect(recipe).to be_valid
      end
    end

    context "when source is 'website'" do
      it "requires website_url" do
        recipe = build(:recipe, :website, website_url: nil)
        expect(recipe).not_to be_valid
        expect(recipe.errors[:website_url]).to be_present
      end

      it "does not require book_title or book_page" do
        recipe = build(:recipe, :website)
        expect(recipe).to be_valid
      end
    end
  end

  describe "associations" do
    it "has many ingredients through recipe_ingredients" do
      recipe = create(:recipe)
      apples = create(:ingredient, name: "Apples")
      create(:recipe_ingredient, recipe: recipe, ingredient: apples, unit: "count", value: 3)

      expect(recipe.ingredients).to contain_exactly(apples)
      expect(recipe.recipe_ingredients.first.unit).to eq("count")
    end

    it "destroys recipe_ingredients when the recipe is destroyed" do
      recipe = create(:recipe)
      create(:recipe_ingredient, recipe: recipe)

      expect { recipe.destroy }.to change(RecipeIngredient, :count).by(-1)
    end
  end

  describe ".all_tags" do
    it "returns a deduplicated list across all recipes" do
      create(:recipe, tags: ["quick", "vegan"])
      create(:recipe, tags: ["quick", "dinner"])
      create(:recipe, tags: [])

      expect(Recipe.all_tags).to contain_exactly("quick", "vegan", "dinner")
    end
  end

  describe ".with_full_ingredients" do
    it "eager-loads recipe_ingredients, ingredients and aisles" do
      aisle = create(:aisle, name: "Produce", order: 1)
      apples = create(:ingredient, name: "Apples", aisle: aisle)
      recipe = create(:recipe)
      create(:recipe_ingredient, recipe: recipe, ingredient: apples)

      loaded = Recipe.with_full_ingredients.find(recipe.id)

      expect(loaded.association(:recipe_ingredients)).to be_loaded
      expect(loaded.recipe_ingredients.first.association(:ingredient)).to be_loaded
      expect(loaded.recipe_ingredients.first.ingredient.association(:aisle)).to be_loaded
    end
  end
end
