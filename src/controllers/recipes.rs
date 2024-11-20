use std::collections::HashSet;

use axum::{extract, response::Response};
use loco_rs::controller::middleware::{self};
use loco_rs::prelude::*;
use sea_orm::Statement;
use serde::{Deserialize, Serialize};

use crate::models::_entities::quantities;
use crate::models::{
    _entities::{self, ingredients_in_recipes, recipes},
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
    pub name: String,
    pub url: Option<String>,
    pub source: String,
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
// TODO: Get rid of this down the line
enum OldRecipeSource {
    Book { title: String, page: i32 },
    Website { url: String },
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
enum RecipeSource {
    Book { title: String, page: i32 },
    Website { url: String },
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
    source: OldRecipeSource,
    tags: Vec<String>,
    rating: i32,
    notes: String,
    ingredients: Vec<UnstoredIngredient>,
}

pub async fn create_recipe(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<CreateRecipe>,
) -> Result<Response> {
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
        OldRecipeSource::Book { title, page } => {
            recipe.source = ActiveValue::set("book".into());
            recipe.book_title = ActiveValue::set(Some(title));
            recipe.book_page = ActiveValue::set(Some(page));
            recipe.website_url = ActiveValue::set(None);
        }
        OldRecipeSource::Website { url } => {
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

    let id = recipe.id.unwrap();

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

#[derive(Deserialize, Debug)]
#[serde(tag = "type", content = "value")]
#[serde(rename_all = "lowercase")]
enum RecipeChange {
    Name(String),
    Tags(Vec<String>),
    Notes(String),
    Source(RecipeSource),
    Duration(String),
    Rating(i32),
    Ingredients(ChangeIngredient),
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
enum ChangeIngredient {
    Add(Ingredient),
    Remove { ingredient: i32 },
    Set { ingredients: Vec<Ingredient> },
}

#[derive(Deserialize, Debug)]
struct Ingredient {
    id: i32,
    // TODO: Conider an enum that can take `String` (i.e. "raw") and `Parsed`...
    quantity: String,
}

#[derive(Deserialize)]
pub struct EditRecipeParameters {
    changes: Vec<RecipeChange>,
}

pub async fn edit_recipe(
    auth: middleware::auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<EditRecipeParameters>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut recipe = recipes::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .into_active_model();

    for change in params.changes {
        match change {
            RecipeChange::Name(name) => recipe.name = ActiveValue::set(name),
            RecipeChange::Tags(tags) => recipe.tags = ActiveValue::set(tags),
            RecipeChange::Notes(notes) => recipe.notes = ActiveValue::set(notes),
            RecipeChange::Source(RecipeSource::Book { title, page }) => {
                recipe.source = ActiveValue::set("book".to_string());
                recipe.book_title = ActiveValue::set(Some(title));
                recipe.book_page = ActiveValue::set(Some(page));
                recipe.website_url = ActiveValue::set(None);
            }
            RecipeChange::Source(RecipeSource::Website { url }) => {
                recipe.source = ActiveValue::set("website".to_string());
                recipe.book_title = ActiveValue::set(None);
                recipe.book_page = ActiveValue::set(None);
                recipe.website_url = ActiveValue::set(Some(url));
            }
            RecipeChange::Duration(d) => recipe.duration = ActiveValue::set(Some(d)),
            RecipeChange::Rating(r) => recipe.rating = ActiveValue::set(r),
            RecipeChange::Ingredients(ChangeIngredient::Add(i)) => {
                let q = Quantity::parse(&i.quantity).into_active_model();
                let q = q.save(&ctx.db).await?;
                ingredients_in_recipes::ActiveModel {
                    recipes_id: ActiveValue::set(id),
                    ingredients_id: ActiveValue::set(i.id),
                    quantities_id: q.id,
                    ..Default::default()
                }
                .save(&ctx.db)
                .await?;
            }
            RecipeChange::Ingredients(ChangeIngredient::Remove { ingredient }) => {
                let entity = ingredients_in_recipes::Entity::find()
                    .filter(
                        ingredients_in_recipes::Column::RecipesId
                            .eq(id)
                            .and(ingredients_in_recipes::Column::IngredientsId.eq(ingredient)),
                    )
                    .one(&ctx.db)
                    .await?;
                if let Some(ingredient) = entity {
                    quantities::Entity::delete_by_id(ingredient.quantities_id)
                        .exec(&ctx.db)
                        .await?;
                    ingredient.delete(&ctx.db).await?;
                }
            }
            RecipeChange::Ingredients(ChangeIngredient::Set { ingredients }) => {
                ingredients_in_recipes::Entity::delete_many()
                    .filter(ingredients_in_recipes::Column::RecipesId.eq(id))
                    .exec(&ctx.db)
                    .await?;

                for i in ingredients {
                    let q = Quantity::parse(&i.quantity).into_active_model();
                    let q = q.save(&ctx.db).await?;
                    ingredients_in_recipes::ActiveModel {
                        recipes_id: ActiveValue::set(id),
                        ingredients_id: ActiveValue::set(i.id),
                        quantities_id: q.id,
                        ..Default::default()
                    }
                    .save(&ctx.db)
                    .await?;
                }
            }
        }
    }

    recipe.save(&ctx.db).await?;

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
        .add("/:id", delete(delete_recipe))
        .add("/:id/ingredients", post(add_ingredient))
        .add("/:id/ingredients/:ingredient", delete(delete_ingredient))
        .add("/:id/edit", post(edit_recipe))
}

#[cfg(test)]
mod tests {
    use super::EditRecipeParameters;

    #[test]
    fn can_extract_changes_to_recipes() {
        let raw_json = r#"
            {
              "changes": [
                {"type": "name", "value": "Tartiflette" },
                {"type": "tags", "value": ["a", "b"] },
                {"type": "notes", "value": "bla bla" },
                {"type": "source", "value": { "type": "book", "title": "bla", "page": 3} },
                {"type": "duration", "value": "34m" },
                {"type": "rating", "value": 3 },
                {"type": "ingredients", "value": { "type": "add", "id": 1, "quantity": "3tbsp"  }},
                {"type": "ingredients", "value": { "type": "remove", "ingredient": 1 }},
                {"type": "ingredients", "value": { "type": "set", "ingredients": [{"id": 1, "quantity": "3tbsp"}, {"id": 5, "quantity": "3x"}] }}
              ]
            }
            "#;

        let _actual: EditRecipeParameters = serde_json::from_str(raw_json).unwrap();
    }
}
