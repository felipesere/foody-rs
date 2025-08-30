use crate::models::ingredients;
use async_graphql::Schema;
use async_graphql::*;
use sea_orm::DatabaseConnection;

pub struct Queries;

pub fn schema_builder(
    pool: DatabaseConnection,
) -> SchemaBuilder<Queries, EmptyMutation, EmptySubscription> {
    Schema::build(Queries, EmptyMutation, EmptySubscription)
        .data(pool)
        .limit_complexity(10)
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
        _tagged: String,
    ) -> Result<TaggedIngredients> {
        let conn = ctx.data::<DatabaseConnection>()?;

        let is = ingredients::ingredient_tags(conn).await?;

        Ok(is
            .into_iter()
            .map(|(name, id, tags)| TaggedIngredient { name, id, tags })
            .collect())
    }

    async fn tags<'ctx>(&self, ctx: &Context<'ctx>) -> Result<Vec<String>> {
        let conn = ctx.data::<DatabaseConnection>()?;

        let t = ingredients::all_tags(conn).await?;

        Ok(t)
    }
}
