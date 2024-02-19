#![allow(clippy::unused_async)]
use axum::extract;
use loco_rs::{controller::middleware, prelude::*};
use sea_orm::{SqlErr, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::models::{
    ingredients::{self, Model as Ingredient},
    users,
};

#[derive(Serialize, Debug)]
pub struct IngredientResponse {
    id: i32,
    name: String,
    tags: Vec<Tag>,
}

#[derive(Serialize, Debug)]
struct Tag {
    id: i32,
    name: String,
    isle_order: i32,
}

impl From<Ingredient> for IngredientResponse {
    fn from(value: Ingredient) -> Self {
        Self {
            id: value.id,
            name: value.name,
            tags: Vec::new(),
        }
    }
}

pub async fn all_ingredients(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Json<Vec<IngredientResponse>>> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let igs: Vec<Ingredient> = ingredients::Entity::find().all(&ctx.db).await?;

    format::json(
        igs.into_iter()
            .map(IngredientResponse::from)
            .collect::<Vec<_>>(),
    )
}

#[derive(Deserialize, Debug)]
pub struct NewIngredient {
    name: String,
    tags: Vec<String>,
}

pub async fn add_ingredient(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewIngredient>,
) -> Result<()> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;

    for _tag in params.tags {
        // TODO!
    }

    let ingredient_outcome = ingredients::ActiveModel {
        name: sea_orm::ActiveValue::Set(params.name),
        ..Default::default()
    }
    .insert(&tx)
    .await;

    match ingredient_outcome {
        Ok(_) => {
            tx.commit().await?;
            Ok(())
        }
        Err(other_err) => {
            if let Some(SqlErr::UniqueConstraintViolation(_)) = other_err.sql_err() {
                tx.commit().await?;
                return Ok(());
            }
            tx.rollback().await?;
            Err(loco_rs::Error::DB(other_err))
        }
    }
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("ingredients")
        .add("/", get(all_ingredients))
        .add("/", post(add_ingredient))
}
