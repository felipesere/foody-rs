use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Tag,
    Tags,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .drop_column(Ingredients::Tag)
                    .to_owned(),
            )
            .await?;

        let add_ingredients_array = Table::alter()
            .table(Ingredients::Table)
            .add_column_if_not_exists(
                array(Ingredients::Tags, ColumnType::string(None))
                    .default(Expr::cust("array[]::varchar[]")),
            )
            .to_owned();

        manager.alter_table(add_ingredients_array).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .add_column_if_not_exists(string_null(Ingredients::Tag))
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .drop_column(Ingredients::Tags)
                    .to_owned(),
            )
            .await
    }
}
