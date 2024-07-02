use axum::{extract, http::StatusCode, response::Response};
use loco_rs::controller::middleware;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{self, ingredients_in_recipes, quantities},
    quantities::Quantity,
    users::users,
};

use super::shoppinglists::QuantityResponse;

#[derive(Serialize, Deserialize, Debug)]
pub struct RecipesResponse {
    pub recipes: Vec<RecipeResponse>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RecipeResponse {
    pub id: i32,
    pub source: String,
    pub name: String,
    pub url: Option<String>,
    pub title: Option<String>,
    pub page: Option<i32>,
    pub ingredients: Vec<IngredientResponse>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IngredientResponse {
    id: i32,
    name: String,
    quantity: Vec<QuantityResponse>,
}

pub async fn all_recipes(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
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
) -> Result<Response> {
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

#[derive(Deserialize, Debug)]
#[serde(untagged)]
enum RecipeSource {
    Book { title: String, page: i32 },
    Website { url: String },
}

#[derive(Deserialize, Debug)]
struct Ingredient {
    id: i32,
    #[serde(deserialize_with = "deserialize_raw_quanitty")]
    quantity: Quantity,
}
fn deserialize_raw_quanitty<'de, D>(deser: D) -> Result<Quantity, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let raw = String::deserialize(deser)?;

    Ok(Quantity::parse(&raw))
}

#[derive(Deserialize, Debug)]
struct IngredientX {
    id: i32,
    quantity: String,
}

#[derive(Deserialize, Debug)]
pub struct CreateRecipe {
    name: String,
    #[serde(flatten)]
    source: RecipeSource,
    ingredients: Vec<IngredientX>,
}

pub async fn create_recipe(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<CreateRecipe>,
) -> Result<StatusCode> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await.unwrap();

    let mut recipe = _entities::recipes::ActiveModel {
        name: ActiveValue::set(params.name),
        ..Default::default()
    };

    match params.source {
        RecipeSource::Book { title, page } => {
            recipe.source = ActiveValue::set("book".into());
            recipe.book_title = ActiveValue::set(Some(title));
            recipe.book_page = ActiveValue::set(Some(page));
            recipe.website_url = ActiveValue::set(None);
        }
        RecipeSource::Website { url } => {
            recipe.source = ActiveValue::set("website".into());
            recipe.website_url = ActiveValue::set(Some(url));
            recipe.book_title = ActiveValue::set(None);
            recipe.book_page = ActiveValue::set(None);
        }
    };
    let recipe = recipe.save(&tx).await?;
    tracing::info!("The recipe is {:?}", recipe.name);
    for i in params.ingredients {
        let q = Quantity::parse(&i.quantity);
        let quantity = q.into_active_model().save(&tx).await?;

        ingredients_in_recipes::ActiveModel {
            recipes_id: recipe.id.clone(),
            quantities_id: quantity.id,
            ingredients_id: ActiveValue::set(i.id),
            ..Default::default()
        }
        .save(&tx)
        .await?;
    }

    tx.commit().await?;

    Ok(StatusCode::OK)
}

#[derive(Deserialize, Debug)]
pub struct UpdateRecipe {
    name: String,
    #[serde(flatten)]
    source: RecipeSource,
    ingredients: Vec<Ingredient>,
}

pub async fn update_recipe(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<UpdateRecipe>,
) -> Result<Response> {
    use crate::models::_entities::prelude::*;
    use crate::models::_entities::recipes::ActiveModel;

    tracing::info!("updating {id} wiht {params:#?}");

    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await.unwrap();

    let r = Recipes::find_by_id(id).one(&tx).await.unwrap().unwrap();

    let mut a: ActiveModel = r.into();
    a.name = ActiveValue::set(params.name);
    match params.source {
        RecipeSource::Book { title, page } => {
            a.source = ActiveValue::set("book".into());
            a.book_title = ActiveValue::set(Some(title));
            a.book_page = ActiveValue::set(Some(page));
            a.website_url = ActiveValue::set(None);
        }
        RecipeSource::Website { url } => {
            a.source = ActiveValue::set("website".into());
            a.website_url = ActiveValue::set(Some(url));
            a.book_title = ActiveValue::set(None);
            a.book_page = ActiveValue::set(None);
        }
    }
    a.save(&tx).await?;

    IngredientsInRecipes::delete_many()
        .filter(ingredients_in_recipes::Column::RecipesId.eq(id))
        .exec(&tx)
        .await?;

    for i in params.ingredients {
        let mut quantity = quantities::ActiveModel::new();
        match i.quantity {
            Quantity::Count(n) => {
                quantity.unit = ActiveValue::set("count".to_string());
                quantity.value = ActiveValue::set(Some(n));
                quantity.text = ActiveValue::not_set();
            }
            Quantity::WithUnit { value, unit } => {
                quantity.unit = ActiveValue::set(unit);
                quantity.value = ActiveValue::set(Some(value));
                quantity.text = ActiveValue::not_set();
            }
            Quantity::Arbitrary(text) => {
                quantity.unit = ActiveValue::set("arbitrary".to_string());
                quantity.value = ActiveValue::not_set();
                quantity.text = ActiveValue::set(Some(text));
            }
        };
        let quantity = quantity.insert(&tx).await?;
        ingredients_in_recipes::ActiveModel {
            recipes_id: ActiveValue::set(id),
            ingredients_id: ActiveValue::set(i.id),
            quantities_id: ActiveValue::set(quantity.id),
            ..Default::default()
        }
        .insert(&tx)
        .await?;
    }
    tx.commit().await?;

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
        .add("/", post(create_recipe))
        .add("/:id", get(recipe))
        .add("/:id", post(update_recipe))
}

#[cfg(test)]
mod tests {
    use super::UpdateRecipe;

    #[test]
    fn can_extract_data_from_edit_recipe_form() {
        let raw_json = r#"
            {
              "id": 6,
              "name": "kartoffellaibchen",
              "source": "website",
              "url": "https://www.gutekueche.at/kartoffellaibchen-rezept-5577",
              "ingredients": [
                {
                  "id": 46,
                  "quantity": "0.5 tsp"
                }
              ]
            }
            "#;

        let _actual: UpdateRecipe = serde_json::from_str(raw_json).unwrap();
    }
}
