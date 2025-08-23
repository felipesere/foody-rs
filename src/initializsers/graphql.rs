use async_graphql::{EmptyMutation, EmptySubscription, Schema};
use async_graphql_axum::GraphQL;
use async_trait::async_trait;
use axum::Router;
use loco_rs::app::{AppContext, Initializer};
use loco_rs::Result;

use crate::graphql::Queries;

pub struct GraphqlContextInitializer;

#[async_trait]
impl Initializer for GraphqlContextInitializer {
    fn name(&self) -> String {
        "GraphqlContextInitializer".to_string()
    }

    /// Occurs after the app's `after_routes`.
    /// Use this to compose additional functionality and wire it into an Axum
    /// Router
    async fn after_routes(&self, router: Router, ctx: &AppContext) -> Result<Router> {
        let pool = ctx.db.clone();
        let schema = Schema::build(Queries, EmptyMutation, EmptySubscription)
            .data(pool)
            .limit_complexity(10)
            .finish();

        let router = router.route_service("/gql", GraphQL::new(schema));

        Ok(router)
    }
}
