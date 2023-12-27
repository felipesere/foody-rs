#![allow(clippy::unused_async)]
use loco_rs::{controller::middleware, prelude::*};
use serde::Serialize;

use crate::models::{
    shoppinglists::{self, Model as Shoppinglists, ShoppinglistIngredients},
    users,
};

#[derive(Serialize)]
pub struct ShoppinglistsResponse {
    shoppinglists: Vec<ShoppinglistResponse>,
}

#[derive(Serialize)]
struct IngredientResponse {}

#[derive(Serialize)]
struct ShoppinglistResponse {
    id: i32,
    name: String,
    ingredients: Vec<IngredientResponse>,
    last_updated: String,
}

impl From<Shoppinglists> for ShoppinglistResponse {
    fn from(value: Shoppinglists) -> Self {
        ShoppinglistResponse {
            id: value.id,
            name: value.name,
            ingredients: Vec::new(),
            last_updated: value.updated_at.format("%Y-%m-%dT%H:%M:%S").to_string(),
        }
    }
}

pub async fn all_shoppinglists(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Json<ShoppinglistsResponse>> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let lists: Vec<(Shoppinglists, Vec<_>)> = shoppinglists::Entity::find()
        .find_with_linked(ShoppinglistIngredients)
        .all(&ctx.db)
        .await?;

    dbg!(&lists);

    format::json(ShoppinglistsResponse {
        shoppinglists: Vec::new(),
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("shoppinglists")
        .add("/", get(all_shoppinglists))
}
