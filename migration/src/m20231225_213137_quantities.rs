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
                table_auto(Quantities::Table)
                    .col(pk_auto(Quantities::Id).borrow_mut())
                    .col(string(Quantities::Unit).borrow_mut())
                    .col(integer_null(Quantities::Value).borrow_mut())
                    .col(string_null(Quantities::Text).borrow_mut())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Quantities::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Quantities {
    Table,
    Id,
    Unit,
    Value,
    Text,
    
}


