use loco_rs::controller::middleware;
use loco_rs::prelude::*;
use serde::Serialize;

use crate::models::users::users;

use super::shoppinglists::QuantityResponse;

#[derive(Serialize, Debug)]
pub struct RecipesResponse {
    recipes: Vec<RecipeResponse>,
}

#[derive(Serialize, Debug)]
pub struct RecipeResponse {
    id: i32,
    source: String,
    name: String,
    url: Option<String>,
    title: Option<String>,
    page: Option<i32>,
    ingredients: Vec<IngredientResponse>,
}

#[derive(Serialize, Debug)]
pub struct IngredientResponse {
    id: i32,
    name: String,
    quantity: Vec<QuantityResponse>,
}

pub async fn all_recipes(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<axum::Json<RecipesResponse>> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut recipes = Vec::new();

    for (recipe, ingredients) in crate::models::recipes::find_all(&ctx.db).await? {
        recipes.push(RecipeResponse {
            id: recipe.id,
            source: recipe.source,
            name: recipe.name,
            url: recipe.website_url,
            title: recipe.book_title,
            page: recipe.book_page,
            ingredients: ingredients
                .into_iter()
                .map(|(ingredient, quantity)| IngredientResponse {
                    id: ingredient.id,
                    name: ingredient.name,
                    quantity: vec![QuantityResponse {
                        id: quantity.id,
                        unit: quantity.unit,
                        value: quantity.value,
                        text: quantity.text,
                    }],
                })
                .collect(),
        })
    }

    format::json(RecipesResponse { recipes })
}

pub async fn recipe(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<axum::Json<RecipeResponse>> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let (recipe, ingredients) = crate::models::recipes::find_one(&ctx.db, id)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(RecipeResponse {
        id: recipe.id,
        source: recipe.source,
        name: recipe.name,
        url: recipe.website_url,
        title: recipe.book_title,
        page: recipe.book_page,
        ingredients: ingredients
            .into_iter()
            .map(|(ingredient, quantity)| IngredientResponse {
                id: ingredient.id,
                name: ingredient.name,
                quantity: vec![QuantityResponse {
                    id: quantity.id,
                    unit: quantity.unit,
                    value: quantity.value,
                    text: quantity.text,
                }],
            })
            .collect(),
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("recipes")
        .add("/", get(all_recipes))
        .add("/:id", get(recipe))
}
