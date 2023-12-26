#![allow(clippy::unused_async)]
use loco_rs::{controller::middleware, prelude::*};
use serde::Serialize;

use crate::models::{
    ingredients::{self, Model as Ingredient},
    users,
};

#[derive(Serialize)]
pub struct IngredientResponse {
    id: i32,
    name: String,
    tags: Vec<Tag>,
}

#[derive(Serialize)]
struct Tag {
    id: i32,
    name: String,
    isle_order: i32,
}

impl From<Ingredient> for IngredientResponse {
    fn from(value: Ingredient) -> Self {
        IngredientResponse {
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("ingredients")
        .add("/", get(all_ingredients))
}
