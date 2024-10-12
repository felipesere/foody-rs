use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Tags,
    Rating,
    Notes,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Recipes::Table)
                    .add_column_if_not_exists(
                        array(Recipes::Tags, ColumnType::string(Some(128)))
                            .default(Expr::cust("array[]::varchar(128)[]")),
                    )
                    .add_column_if_not_exists(integer(Recipes::Rating).default(0))
                    .add_column_if_not_exists(text(Recipes::Notes).default(""))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Recipes::Table)
                    .drop_column(Recipes::Tags)
                    .drop_column(Recipes::Rating)
                    .drop_column(Recipes::Notes)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
