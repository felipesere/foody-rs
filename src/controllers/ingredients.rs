use std::collections::HashSet;

use axum::{extract, http::StatusCode};
use loco_rs::prelude::*;
use migration::{Expr, SimpleExpr};
use sea_orm::{ActiveValue, SqlErr, Statement, TransactionTrait, Value};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{
        aisles::{self},
        ingredients, ingredients_in_recipes, ingredients_in_shoppinglists,
    },
    aisles::{AisleRef, Model as Aisle, PartialAisle},
    ingredients::Model as Ingredient,
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

impl From<(Ingredient, Option<AisleRef>)> for IngredientResponse {
    fn from((value, aisle): (Ingredient, Option<AisleRef>)) -> Self {
        Self {
            id: value.id,
            name: value.name,
            tags: value.tags,
            aisle: aisle.map(|a| AisleResponse {
                name: a.name,
                order: a.order,
            }),
            stored_in: None,
        }
    }
}

pub async fn all_ingredients(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let igs: Vec<(Ingredient, Option<Aisle>)> = ingredients::Entity::find()
        .find_also_related(aisles::Entity)
        .all(&ctx.db)
        .await?;

    format::json(
        igs.into_iter()
            .map(|(ingreient, aisle)| {
                IngredientResponse::from((ingreient, aisle.map(AisleRef::from)))
            })
            .collect::<Vec<_>>(),
    )
}

#[derive(Deserialize, Debug)]
pub struct NewIngredient {
    name: String,
    tags: Vec<String>,
}

pub async fn add_ingredient(
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
            format::json(IngredientResponse::from((ingredient, None)))
        }
        Err(other_err) => {
            if let Some(SqlErr::UniqueConstraintViolation(_)) = other_err.sql_err() {
                tx.commit().await?;

                let ingredient = ingredients::Entity::find()
                    .filter(ingredients::Column::Name.eq(params.name))
                    .one(&ctx.db)
                    .await?
                    .ok_or(Error::NotFound)?;

                return format::json(IngredientResponse::from((ingredient, None)));
            }
            tx.rollback().await?;
            Err(loco_rs::Error::DB(other_err))
        }
    }
}

#[derive(Deserialize)]
struct SetTagsParams {
    tags: Vec<String>,
}

async fn set_tags_in_ingredient(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(params): extract::Json<SetTagsParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    ingredients::Entity::update_many()
        .col_expr(ingredients::Column::Tags, Expr::value(params.tags))
        .filter(ingredients::Column::Id.eq(id))
        .exec(&ctx.db)
        .await?;

    Ok(())
}

#[derive(Deserialize)]
struct SetAisleParams {
    aisle: Option<String>,
}

async fn set_aisle_in_ingredient(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(params): extract::Json<SetAisleParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let aisle = match params.aisle {
        Some(name) => {
            let n = aisles::Entity::find()
                .filter(aisles::Column::Name.eq(name))
                .one(&ctx.db)
                .await?;
            n.map(|aisle| aisle.id)
        }
        None => None,
    };

    ingredients::Entity::update_many()
        .col_expr(
            ingredients::Column::Aisle,
            SimpleExpr::Value(Value::Int(aisle)), // null if we chose to remove an aisle
        )
        .filter(ingredients::Column::Id.eq(id))
        .exec(&ctx.db)
        .await?;

    Ok(())
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/ingredients")
        .add("/", get(all_ingredients))
        .add("/", post(add_ingredient))
        .add("/tags", get(all_ingredients_tags))
        .add("/{id}/tags", post(set_tags_in_ingredient))
        .add("/{id}/aisle", post(set_aisle_in_ingredient))
        .add("/merge", post(merge_ingredients))
}
