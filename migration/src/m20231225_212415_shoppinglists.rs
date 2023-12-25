use std::borrow::BorrowMut;

use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(Shoppinglists::Table)
                    .col(pk_auto(Shoppinglists::Id).borrow_mut())
                    .col(string(Shoppinglists::Name).borrow_mut())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Shoppinglists::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Shoppinglists {
    Table,
    Id,
    Name,
}
