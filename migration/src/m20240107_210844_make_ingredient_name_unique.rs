use std::borrow::BorrowMut;

use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_orm::DatabaseBackend;
use sea_orm_migration::sea_orm::Statement;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Name,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.alter_table(
            Table::alter().table(Ingredients::Table)
            .modify_column(ColumnDef::new(Ingredients::Name).string().unique_key().borrow_mut()).to_owned()
            ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let drop_index = Statement::from_string(DatabaseBackend::Postgres, "ALTER TABLE ingredients DROP CONSTRAINT ingredients_name_key");
        let conn = manager.get_connection();
        conn.execute(drop_index).await.map(|_| ())
    }
}

