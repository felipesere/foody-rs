use loco_rs::schema::string_null;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum IngredientsInShoppinglists {
    Table,
    Note,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(IngredientsInShoppinglists::Table)
                    .add_column_if_not_exists(string_null(IngredientsInShoppinglists::Note))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(IngredientsInShoppinglists::Table)
                    .drop_column(IngredientsInShoppinglists::Note)
                    .to_owned(),
            )
            .await
    }
}
