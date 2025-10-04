use axum::{
    extract::{self, State},
    routing::get,
};
use loco_rs::prelude::*;
use sea_orm::{QueryOrder, QuerySelect};
use serde::{Deserialize, Serialize};

use crate::models::{_entities::aisles, users};

#[derive(Serialize, Deserialize, Debug)]
struct FullAisleResponse {
    id: i32,
    name: String,
    order: i16,
}

#[derive(Serialize, Deserialize, Debug)]
struct AislesResponse {
    aisles: Vec<FullAisleResponse>,
}

pub async fn all_ailes(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let ailes = aisles::Entity::find().all(&ctx.db).await?;

    format::json(AislesResponse {
        aisles: ailes
            .into_iter()
            .map(|a| FullAisleResponse {
                id: a.id,
                name: a.name,
                order: a.order,
            })
            .collect(),
    })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NewAisle {
    name: String,
}

pub async fn create_aisle(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewAisle>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let order = aisles::Entity::find()
        .order_by(aisles::Column::Order, sea_orm::Order::Desc)
        .limit(1)
        .one(&ctx.db)
        .await?
        .map(|aisle| aisle.order)
        .unwrap_or(0);

    let model = aisles::ActiveModel {
        name: Set(params.name),
        order: Set(order + 1),
        ..Default::default()
    };

    let n = model.save(&ctx.db).await?;

    format::json(FullAisleResponse {
        id: n.id.unwrap(),
        name: n.name.unwrap(),
        order: n.order.unwrap(),
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/aisles")
        .add("/", get(all_ailes))
        .add("/", post(create_aisle))
}
