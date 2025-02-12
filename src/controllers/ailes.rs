use axum::{extract::State, routing::get};
use loco_rs::{controller::middleware, prelude::*};
use serde::{Deserialize, Serialize};

use crate::models::{_entities::aisles, users};

#[derive(Serialize, Deserialize, Debug)]
struct FullAisleResponse {
    id: i32,
    name: String,
    order: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct AislesResponse {
    aisles: Vec<FullAisleResponse>,
}

pub async fn all_ailes(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
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

pub fn routes() -> Routes {
    Routes::new().prefix("api/aisles").add("/", get(all_ailes))
}
