use sea_orm_migration::{prelude::*, schema::*};

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
                    .drop_column(Ingredients::Tags)
                    .to_owned(),
            )
            .await;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Ingredients::Table)
                    .add_column_if_not_exists(
                        array(Ingredients::Tags, ColumnType::string(None))
                            .default(Expr::cust("array[]::varchar[]")),
                    )
                    .to_owned(),
            )
            .await
    }
}
