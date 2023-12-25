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
                table_auto(Ingredients::Table)
                    .col(pk_auto(Ingredients::Id).borrow_mut())
                    .col(string(Ingredients::Name).borrow_mut().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Ingredients::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Id,
    Name,
    
}


