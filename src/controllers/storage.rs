use axum::debug_handler;
use loco_rs::prelude::*;
use serde::Serialize;

use crate::{
    controllers::ingredients::StorageResponse,
    models::{storages, users},
};

#[derive(Serialize)]
pub struct ListStorageResponse {
    storage: Vec<StorageResponse>,
}

#[debug_handler]
pub async fn index(auth: auth::JWT, State(ctx): State<AppContext>) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let storage_locations = storages::Entity::find().all(&ctx.db).await?;

    format::json(ListStorageResponse {
        storage: storage_locations
            .into_iter()
            .map(|s| StorageResponse {
                id: s.id,
                name: s.name,
                order: s.order,
            })
            .collect(),
    })
}

pub fn routes() -> Routes {
    Routes::new().prefix("api/storages/").add("/", get(index))
}
