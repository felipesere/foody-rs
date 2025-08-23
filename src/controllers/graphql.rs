use async_graphql::{EmptyMutation, EmptySubscription, Schema};
use async_graphql_axum::GraphQL;
use axum::routing::post_service;
use loco_rs::{app::AppContext, prelude::Routes};

use crate::graphql::Queries;

pub fn routes(ctx: &AppContext) -> Routes {
    let pool = ctx.db.clone();
    let schema = Schema::build(Queries, EmptyMutation, EmptySubscription)
        .data(pool)
        .limit_complexity(10)
        .finish();

    Routes::new()
        .prefix("api/gql")
        .add("/", post_service(GraphQL::new(schema)))
}
