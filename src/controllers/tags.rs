use axum::{extract, http::StatusCode, response::Response};
use loco_rs::{controller::middleware, prelude::*};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{self, tags},
    users,
};

#[derive(Serialize)]
struct Tag {
    name: String,
    order: Option<i32>,
    is_aisle: bool,
}

impl From<tags::Model> for Tag {
    fn from(value: tags::Model) -> Self {
        Self {
            name: value.name,
            order: value.order,
            is_aisle: value.is_aisle,
        }
    }
}

pub async fn all_tags(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let ts = tags::Entity::find().all(&ctx.db).await?;

    format::json(ts.into_iter().map(Tag::from).collect::<Vec<_>>())
}

#[derive(Deserialize)]
pub struct CreateTagParams {
    name: String,
}

pub async fn create_tag(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<CreateTagParams>,
) -> Result<StatusCode> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    _entities::tags::Entity::upsert(&ctx.db, params.name).await?;

    Ok(StatusCode::OK)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/tags")
        .add("/", get(all_tags))
        .add("/", post(create_tag))
}
