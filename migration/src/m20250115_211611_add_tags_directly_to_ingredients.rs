use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Tags,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .add_column_if_not_exists(
                        array(Ingredients::Tags, ColumnType::string(Some(128)))
                            .default(Expr::cust("array[]::varchar(128)[]")),
                    )
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();

        // migrate the data over to the new column
        db.execute_unprepared(
            r#"
                    WITH ingredient_tags AS (
                        SELECT i.name, array_agg(t.name) as tags
                        FROM ingredients i
                                 JOIN tags_on_ingredients as toi on i.id = toi.ingredient_id
                                 JOIN tags t on t.id = toi.tag_id
                        GROUP BY i.name
                    ) UPDATE ingredients AS i SET tags = ingredient_tags.tags FROM ingredient_tags WHERE i.name = ingredient_tags.name;
                 "#,
        )
        .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .drop_column(Ingredients::Tags)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
