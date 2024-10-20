use std::borrow::BorrowMut;

use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(Recipes::Table)
                    .col(pk_auto(Recipes::Id).borrow_mut())
                    .col(string(Recipes::Name).borrow_mut())
                    .col(string_null(Recipes::BookTitle).borrow_mut())
                    .col(integer_null(Recipes::BookPage).borrow_mut())
                    .col(string_null(Recipes::WebsiteUrl).borrow_mut())
                    .col(string(Recipes::Source).borrow_mut())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Recipes::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Id,
    Name,
    Source,
    BookTitle,
    BookPage,
    WebsiteUrl,
}
