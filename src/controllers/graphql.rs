use axum::{body::Body, extract::State, http::Request, routing::post};
use loco_rs::{app::AppContext, prelude::*};

use crate::{
    graphql::{self},
    models::users::{self},
};

pub fn routes() -> Routes {
    Routes::new().prefix("api/gql").add("/", post(gql_handler))
}

pub async fn gql_handler(
    auth: auth::JWT,
    State(ctx): State<AppContext>,
    req: Request<Body>,
) -> Result<Response> {
    use tower_service::Service;

    let user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let schema = graphql::schema_builder(ctx.db.clone()).data(user).finish();
    let mut graphql_svc = async_graphql_axum::GraphQL::new(schema);
    // Execute GraphQL request and fetch the results
    let res = graphql_svc.call(req).await.unwrap();

    Ok(res)
}
