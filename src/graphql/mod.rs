use crate::models::ingredients;
use async_graphql::Schema;
use async_graphql::*;
use sea_orm::DatabaseConnection;

pub struct Queries;

pub fn schema(pool: DatabaseConnection) -> Schema<Queries, EmptyMutation, EmptySubscription> {
    Schema::build(Queries, EmptyMutation, EmptySubscription)
        .data(pool)
        .limit_complexity(10)
        .finish()
}

#[derive(SimpleObject)]
struct TaggedIngredient {
    name: String,
    id: i32,
    tags: Vec<String>,
}

type TaggedIngredients = Vec<TaggedIngredient>;

#[Object]
impl Queries {
    async fn all_tags<'ctx>(
        &self,
        ctx: &Context<'ctx>,
        tagged: String,
    ) -> Result<TaggedIngredients> {
        tracing::info!(t = tagged, "getting all tags");
        let conn = ctx.data::<DatabaseConnection>()?;

        let is = ingredients::ingredient_tags(conn).await?;

        Ok(is
            .into_iter()
            .map(|(name, id, tags)| TaggedIngredient { name, id, tags })
            .collect())
    }
}
