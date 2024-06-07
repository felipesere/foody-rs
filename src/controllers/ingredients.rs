#![allow(clippy::unused_async)]
use axum::extract;
use ingredients::ingredients::IngredientToTags;
use loco_rs::{controller::middleware, prelude::*};
use sea_orm::{ActiveValue, SqlErr, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{
        tags::{self, batch_insert_if_not_exists, Model as Tag},
        tags_on_ingredients,
    },
    ingredients::{self, Model as Ingredient},
    users,
};

#[derive(Serialize, Debug)]
pub struct IngredientResponse {
    id: i32,
    name: String,
    tags: Vec<String>,
}

impl From<(Ingredient, Vec<Tag>)> for IngredientResponse {
    fn from((value, tags): (Ingredient, Vec<Tag>)) -> Self {
        Self {
            id: value.id,
            name: value.name,
            tags: tags.into_iter().map(|t| t.name).collect(),
        }
    }
}

pub async fn all_ingredients(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let igs: Vec<(Ingredient, Vec<tags::Model>)> = ingredients::Entity::find()
        .find_with_linked(IngredientToTags)
        .all(&ctx.db)
        .await?;

    dbg!(&igs);

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

    let tags = if !params.tags.is_empty() {
        batch_insert_if_not_exists(&tx, &params.tags).await?
    } else {
        vec![]
    };

    let ingredient_outcome = ingredients::ActiveModel {
        name: ActiveValue::Set(params.name.clone()),
        ..Default::default()
    }
    .insert(&tx)
    .await;

    match ingredient_outcome {
        Ok(ingredient) => {
            if !params.tags.is_empty() {
                let mut tags_on_ingredient = Vec::new();
                for tag_id in tags {
                    tags_on_ingredient.push(tags_on_ingredients::ActiveModel {
                        tag_id: ActiveValue::Set(tag_id),
                        ingredient_id: ActiveValue::Set(ingredient.id),
                        ..Default::default()
                    })
                }

                tags_on_ingredients::Entity::insert_many(tags_on_ingredient)
                    .exec(&tx)
                    .await?;
            }

            tx.commit().await?;
            format::json(IngredientResponse::from((ingredient, vec![])))
        }
        Err(other_err) => {
            if let Some(SqlErr::UniqueConstraintViolation(_)) = other_err.sql_err() {
                tx.commit().await?;

                let ingredient = ingredients::Entity::find()
                    .filter(ingredients::ingredients::Column::Name.eq(params.name))
                    .one(&ctx.db)
                    .await?
                    .ok_or(Error::NotFound)?;

                return format::json(IngredientResponse::from((ingredient, vec![])));
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

    let tag_ids = batch_insert_if_not_exists(&tx, &params.tags).await?;

    let tags: Vec<_> = tag_ids
        .into_iter()
        .map(|tag_id| tags_on_ingredients::ActiveModel {
            tag_id: ActiveValue::Set(tag_id),
            ingredient_id: ActiveValue::Set(ingredient.id),
            ..Default::default()
        })
        .collect();

    tags_on_ingredients::Entity::insert_many(tags)
        .exec(&tx)
        .await?;

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
