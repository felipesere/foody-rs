require "rails_helper"

RSpec.describe "User attribution", type: :request do
  # The global before signs in the default user and sets Current.
  it "stamps created_by/updated_by, and only updated_by changes on edit" do
    creator = Current.user

    post "/api/v1/recipes",
         params: {
           recipe: { name: "Stew", source: "book", book_title: "B", book_page: 1 },
           ingredients: []
         },
         as: :json
    expect(response).to have_http_status(:created)

    recipe = Recipe.find(response.parsed_body["id"])
    expect(recipe.created_by).to eq(creator)
    expect(recipe.updated_by).to eq(creator)

    editor = create(:user, group: creator.group)
    sign_in(editor)

    put "/api/v1/recipes/#{recipe.id}",
        params: { recipe: { name: "Better Stew" } },
        as: :json
    expect(response).to have_http_status(:ok)

    recipe.reload
    expect(recipe.created_by).to eq(creator)
    expect(recipe.updated_by).to eq(editor)
  end

  it "records who added a shoppinglist item" do
    actor = Current.user
    list = create(:shoppinglist)
    ingredient = create(:ingredient)

    post "/api/v1/shoppinglists/#{list.id}/items",
         params: { ingredient_id: ingredient.id, quantity: "1x" },
         as: :json
    expect(response).to have_http_status(:created)

    expect(list.shoppinglist_items.sole.created_by).to eq(actor)
  end
end
