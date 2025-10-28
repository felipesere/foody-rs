use std::collections::HashSet;

use axum::{extract, http::StatusCode};
use loco_rs::prelude::*;
use migration::Expr;
use sea_orm::{ActiveValue, SqlErr, Statement, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{
        aisles::{self},
        ingredients, ingredients_in_recipes, ingredients_in_shoppinglists,
    },
    aisles::{AisleRef, Model as Aisle, PartialAisle},
    ingredients::Model as Ingredient,
    storages::{self, Model as Storage},
    users,
};

use super::TagsResponse;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AisleResponse {
    pub name: String,
    pub order: i16,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorageResponse {
    pub id: i32,
    pub name: String,
    pub order: i16,
}

impl From<PartialAisle> for AisleResponse {
    fn from(value: PartialAisle) -> Self {
        Self {
            name: value.name,
            order: value.order,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct IngredientResponse {
    pub id: i32,
    pub name: String,
    pub aisle: Option<AisleResponse>,
    pub tags: Vec<String>,
    pub stored_in: Option<StorageResponse>,
}

impl From<(Ingredient, Option<AisleRef>, Option<Storage>)> for IngredientResponse {
    fn from((value, aisle, stored_in): (Ingredient, Option<AisleRef>, Option<Storage>)) -> Self {
        Self {
            id: value.id,
            name: value.name,
            tags: value.tags,
            aisle: aisle.map(|a| AisleResponse {
                name: a.name,
                order: a.order,
            }),
            stored_in: stored_in.map(|s| StorageResponse {
                id: s.id,
                name: s.name,
                order: s.order,
            }),
        }
    }
}

pub async fn index(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let igs: Vec<(Ingredient, Option<Aisle>, Option<Storage>)> = ingredients::Entity::find()
        .find_also_related(aisles::Entity)
        .find_also_related(storages::Entity)
        .all(&ctx.db)
        .await?;

    format::json(
        igs.into_iter()
            .map(|(ingredient, aisle, stored_in)| {
                IngredientResponse::from((ingredient, aisle.map(AisleRef::from), stored_in))
            })
            .collect::<Vec<_>>(),
    )
}

#[derive(Deserialize, Debug)]
pub struct NewIngredient {
    name: String,
    tags: Vec<String>,
}

pub async fn create(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewIngredient>,
) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;

    let ingredient_outcome = ingredients::ActiveModel {
        name: ActiveValue::Set(params.name.clone()),
        tags: ActiveValue::Set(params.tags),
        ..Default::default()
    }
    .insert(&tx)
    .await;

    match ingredient_outcome {
        Ok(ingredient) => {
            tx.commit().await?;
            format::json(IngredientResponse::from((ingredient, None, None)))
        }
        Err(other_err) => {
            if let Some(SqlErr::UniqueConstraintViolation(_)) = other_err.sql_err() {
                tx.commit().await?;

                let ingredient = ingredients::Entity::find()
                    .filter(ingredients::Column::Name.eq(params.name))
                    .one(&ctx.db)
                    .await?
                    .ok_or(Error::NotFound)?;

                return format::json(IngredientResponse::from((ingredient, None, None)));
            }
            tx.rollback().await?;
            Err(loco_rs::Error::DB(other_err))
        }
    }
}

#[derive(Deserialize)]
struct MergeIngredientsParams {
    /// Replace these ingredient IDs...
    replace: Vec<u32>,
    /// ...with this ingredient ID.
    target: u32,
}

async fn merge_ingredients(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<MergeIngredientsParams>,
) -> Result<StatusCode> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;
    // ...recipes
    ingredients_in_recipes::Entity::update_many()
        .col_expr(
            ingredients_in_recipes::Column::IngredientsId,
            Expr::value(params.target),
        )
        .filter(ingredients_in_recipes::Column::IngredientsId.is_in(params.replace.clone()))
        .exec(&tx)
        .await?;

    // ...shoppinglists
    ingredients_in_shoppinglists::Entity::update_many()
        .col_expr(
            ingredients_in_shoppinglists::Column::IngredientsId,
            Expr::value(params.target),
        )
        .filter(ingredients_in_shoppinglists::Column::IngredientsId.is_in(params.replace.clone()))
        .exec(&tx)
        .await?;

    // delete the actual ingredients
    ingredients::Entity::delete_many()
        .filter(ingredients::Column::Id.is_in(params.replace.clone()))
        .exec(&tx)
        .await?;

    tx.commit().await?;

    Ok(StatusCode::OK)
}

pub async fn all_ingredients_tags(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let db = ctx.db;

    let tags_statement = Statement::from_string(
        db.get_database_backend(),
        r#"SELECT DISTINCT(unnest("tags")) as "tags" from ingredients;"#,
    );

    let results = db.query_all(tags_statement).await?;

    let mut unique_tags = HashSet::default();
    for qr in results {
        let tag = qr.try_get("", "tags")?;
        unique_tags.insert(tag);
    }

    format::json(TagsResponse { tags: unique_tags })
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type", content = "value")]
#[serde(rename_all = "lowercase")]
enum IngredientChange {
    Name(String),
    Tags(Vec<String>),
    Aisle(Option<String>),
    StoredIn(Option<i32>),
}

#[derive(Deserialize)]
pub struct EditIngredientParams {
    changes: Vec<IngredientChange>,
}

pub async fn edit(
    auth: auth::JWT,
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<EditIngredientParams>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut ingredient = ingredients::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .into_active_model();

    for change in params.changes {
        match change {
            IngredientChange::Name(name) => {
                ingredient.name = ActiveValue::Set(name);
            }
            IngredientChange::Tags(tags) => {
                ingredient.tags = ActiveValue::Set(tags);
            }
            IngredientChange::Aisle(aisle_name) => {
                let aisle_id = match aisle_name {
                    Some(name) => {
                        let aisle = aisles::Entity::find()
                            .filter(aisles::Column::Name.eq(name))
                            .one(&ctx.db)
                            .await?;
                        aisle.map(|a| a.id)
                    }
                    None => None,
                };
                ingredient.aisle = ActiveValue::Set(aisle_id);
            }
            IngredientChange::StoredIn(storage_id) => {
                ingredient.stored_in = ActiveValue::Set(storage_id.map(|id| id as i16));
            }
        }
    }

    let updated_ingredient = ingredient.update(&ctx.db).await?;

    // Fetch related aisle and storage for the response
    let aisle = match updated_ingredient.aisle {
        Some(aisle_id) => aisles::Entity::find_by_id(aisle_id)
            .one(&ctx.db)
            .await?
            .map(AisleRef::from),
        None => None,
    };

    let storage = match updated_ingredient.stored_in {
        Some(storage_id) => {
            storages::Entity::find_by_id(storage_id)
                .one(&ctx.db)
                .await?
        }
        None => None,
    };

    format::json(IngredientResponse::from((
        updated_ingredient,
        aisle,
        storage,
    )))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/ingredients")
        .add("/", get(index))
        .add("/", post(create))
        .add("/tags", get(all_ingredients_tags))
        .add("/{id}", post(edit))
        .add("/merge", post(merge_ingredients))
}
