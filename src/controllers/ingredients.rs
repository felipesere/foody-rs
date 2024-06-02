#![allow(clippy::unused_async)]
use axum::extract;
use ingredients::ingredients::ActiveModel;
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
    tags: Vec<String>,
}

impl From<Ingredient> for IngredientResponse {
    fn from(value: Ingredient) -> Self {
        Self {
            id: value.id,
            name: value.name,
            tags: value.tags,
        }
    }
}

pub async fn all_ingredients(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
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
) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;

    let ingredient_outcome = ingredients::ActiveModel {
        name: sea_orm::ActiveValue::Set(params.name.clone()),
        tags: sea_orm::ActiveValue::Set(params.tags.clone()),
        ..Default::default()
    }
    .insert(&tx)
    .await;

    match ingredient_outcome {
        Ok(ingredient) => {
            tx.commit().await?;
            format::json(IngredientResponse::from(ingredient))
        }
        Err(other_err) => {
            if let Some(SqlErr::UniqueConstraintViolation(_)) = other_err.sql_err() {
                tx.commit().await?;

                let ingredient = ingredients::Entity::find()
                    .filter(ingredients::ingredients::Column::Name.eq(params.name))
                    .one(&ctx.db)
                    .await?
                    .ok_or(Error::NotFound)?;

                return format::json(IngredientResponse::from(ingredient));
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
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(params): extract::Json<SetTagsParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let tx = ctx.db.begin().await?;
    let ingredient = ingredients::Entity::find_by_id(id)
        .one(&tx)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut model = ActiveModel::from(ingredient);
    model.tags = ActiveValue::set(params.tags);
    model.save(&tx).await?;
    tx.commit().await?;

    Ok(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("ingredients")
        .add("/", get(all_ingredients))
        .add("/", post(add_ingredient))
        .add("/:id/tags", post(set_tags_in_ingredient))
}
