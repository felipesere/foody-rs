use std::collections::HashSet;

use axum::{extract, http::StatusCode, response::Response};
use loco_rs::controller::middleware::{self};
use loco_rs::prelude::*;
use migration::Expr;
use sea_orm::Statement;
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{self, ingredients_in_recipes, quantities, recipes},
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
    pub tags: Vec<String>,
    pub rating: i32,
    pub notes: String,
    pub duration: Option<String>,
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
            tags: recipe.tags,
            rating: recipe.rating,
            notes: recipe.notes,
            duration: recipe.duration,
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
        tags: recipe.tags,
        rating: recipe.rating,
        notes: recipe.notes,
        duration: recipe.duration,
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
pub async fn delete_recipe(
    auth: middleware::auth::JWT,
    Path(recipe_id): Path<i32>,
    State(ctx): State<AppContext>,
) -> Result<()> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;

    ingredients_in_recipes::Entity::delete_many()
        .filter(ingredients_in_recipes::Column::RecipesId.eq(recipe_id))
        .exec(&tx)
        .await?;

    recipes::Entity::delete_by_id(recipe_id).exec(&tx).await?;

    tx.commit().await?;

    Ok(())
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
struct UnstoredQuantity {
    unit: String,
    value: Option<f32>,
    text: Option<String>,
}

impl From<UnstoredQuantity> for Quantity {
    fn from(value: UnstoredQuantity) -> Self {
        let unit = value.unit;

        match (value.value, value.text) {
            (Some(value), None) if unit == "count" => Self::Count(value),
            (Some(value), None) => Self::WithUnit { value, unit },
            (None, Some(arbitrary)) => Self::Arbitrary(arbitrary),
            (Some(_), Some(_)) | (None, None) => {
                unimplemented!("Shouldn't have a value and a text")
            }
        }
    }
}

#[derive(Deserialize, Debug)]
struct UnstoredIngredient {
    id: i32,
    quantity: Vec<UnstoredQuantity>,
}

#[derive(Deserialize, Debug)]
pub struct CreateRecipe {
    name: String,
    #[serde(flatten)]
    source: RecipeSource,
    tags: Vec<String>,
    rating: i32,
    notes: String,
    ingredients: Vec<UnstoredIngredient>,
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
        rating: ActiveValue::set(params.rating),
        notes: ActiveValue::set(params.notes),
        tags: ActiveValue::set(params.tags),
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
    for mut i in params.ingredients {
        let q = Quantity::from(i.quantity.remove(0));
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
    tags: Vec<String>,
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
    a.tags = ActiveValue::set(params.tags);
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
        tags: recipe.tags,
        rating: recipe.rating,
        notes: recipe.notes,
        duration: recipe.duration,
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

#[derive(Deserialize)]
pub struct SetRecipeTagsParams {
    tags: Vec<String>,
}

pub async fn set_recipe_tags(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<SetRecipeTagsParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let r = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or(Error::NotFound)?;

    let mut recipe = r.into_active_model();
    recipe.tags = ActiveValue::set(params.tags);
    recipe.save(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct SetRecipeNotesParams {
    notes: String,
}

pub async fn set_recipe_notes(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<SetRecipeNotesParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let r = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or(Error::NotFound)?;

    let mut recipe = r.into_active_model();
    recipe.notes = ActiveValue::set(params.notes);
    recipe.save(&ctx.db).await?;

    Ok(())
}

#[derive(Serialize)]
struct TagsResponse {
    tags: HashSet<String>,
}

pub async fn all_recipe_tags(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let db = ctx.db;

    let backend = db.get_database_backend();

    let tags_statement = Statement::from_string(
        backend,
        r#"SELECT DISTINCT(unnest("tags")) as "tags" from recipes;"#,
    );

    let results = db.query_all(tags_statement).await?;

    let mut unique_tags = HashSet::default();
    for qr in results {
        let tag = qr.try_get("", "tags")?;
        unique_tags.insert(tag);
    }

    format::json(TagsResponse { tags: unique_tags })
}

pub async fn set_recipe_rating(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, rating)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let r = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or(Error::NotFound)?;

    let mut recipe = r.into_active_model();
    recipe.rating = ActiveValue::set(rating);
    recipe.save(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct AddIngredientParams {
    ingredient: i32,
    quantity: String,
}

pub async fn add_ingredient(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<AddIngredientParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let q = Quantity::parse(&params.quantity);

    let tx = ctx.db.begin().await?;

    let recipe = recipes::Entity::find_by_id(id)
        .one(&tx)
        .await?
        .ok_or(Error::NotFound)?;

    let stored_quantity = q.into_active_model().save(&tx).await?;

    ingredients_in_recipes::ActiveModel {
        recipes_id: ActiveValue::set(recipe.id),
        ingredients_id: ActiveValue::set(params.ingredient),
        quantities_id: stored_quantity.id,
        ..Default::default()
    }
    .save(&tx)
    .await?;

    tx.commit().await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct SetRecipeNameParams {
    name: String,
}

pub async fn set_recipe_name(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<SetRecipeNameParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    recipes::Entity::update_many()
        .col_expr(recipes::Column::Name, Expr::value(params.name))
        .filter(recipes::Column::Id.eq(id))
        .exec(&ctx.db)
        .await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct SetRecipeSourceParams {
    #[serde(flatten)]
    source: RecipeSource,
}

pub async fn set_recipe_source(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<SetRecipeSourceParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut a = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .into_active_model();

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
    a.save(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct SetRecipeDurationParams {
    duration: String,
}

pub async fn set_recipe_duration(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<SetRecipeDurationParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut a = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .into_active_model();

    a.duration = ActiveValue::set(Some(params.duration));

    a.save(&ctx.db).await?;

    Ok(())
}

pub async fn delete_ingredient(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, ingredient)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    ingredients_in_recipes::Entity::delete_many()
        .filter(ingredients_in_recipes::Column::RecipesId.eq(id))
        .filter(ingredients_in_recipes::Column::IngredientsId.eq(ingredient))
        .exec(&ctx.db)
        .await?;

    Ok(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("recipes")
        .add("/tags", get(all_recipe_tags))
        .add("/", get(all_recipes))
        .add("/", post(create_recipe))
        .add("/:id", get(recipe))
        .add("/:id", post(update_recipe))
        .add("/:id", delete(delete_recipe))
        .add("/:id/name", put(set_recipe_name))
        .add("/:id/tags", put(set_recipe_tags))
        .add("/:id/notes", post(set_recipe_notes))
        .add("/:id/source", put(set_recipe_source))
        .add("/:id/duration", put(set_recipe_duration))
        .add("/:id/rating/:value", post(set_recipe_rating))
        .add("/:id/ingredients", post(add_ingredient))
        .add("/:id/ingredients/:ingredient", delete(delete_ingredient))
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
              ],
              "tags": ["vegetarian"]
            }
            "#;

        let _actual: UpdateRecipe = serde_json::from_str(raw_json).unwrap();
    }
}
