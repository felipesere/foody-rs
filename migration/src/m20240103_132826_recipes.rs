use std::borrow::BorrowMut;

use loco_rs::schema::*;
use sea_orm::EnumIter;
use sea_orm_migration::prelude::ColumnDef;
use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_query::extension::postgres::Type;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_type(
                Type::create()
                    .as_enum(Source::Source)
                    .values([Source::Book, Source::Website])
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(Recipes::Table)
                    .col(pk_auto(Recipes::Id).borrow_mut())
                    .col(string(Recipes::Name).borrow_mut())
                    .col(string_null(Recipes::BookTitle).borrow_mut())
                    .col(integer_null(Recipes::BookPage).borrow_mut())
                    .col(string_null(Recipes::WebsiteUrl).borrow_mut())
                    .col(
                        ColumnDef::new(Recipes::Source)
                            .enumeration(Source::Source, [Source::Book, Source::Website])
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Recipes::Table).to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name(Source::Source).to_owned())
            .await
    }
}

#[derive(Iden, EnumIter)]
pub enum Source {
    Source, // wtf?
    #[iden = "book"]
    Book,
    #[iden = "website"]
    Website,
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
