use sea_orm::sea_query::ColumnDef;
use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_orm::EnumIter;
use sea_orm_migration::sea_query::extension::postgres::Type;

#[derive(DeriveMigrationName)]
pub struct Migration;

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
    Source,
    BookTitle,
    WebsiteUrl,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // drop the old column
        manager
            .alter_table(
                Table::alter()
                    .table(Recipes::Table)
                    .drop_column(Recipes::Source)
                    .to_owned(),
            )
            .await?;

        // drop the old type
        manager
            .drop_type(Type::drop().name(Source::Source).to_owned())
            .await?;

        // bring it back, with nulls
        manager
            .alter_table(
                Table::alter()
                    .table(Recipes::Table)
                    .add_column(ColumnDef::new(Recipes::Source).string())
                    .to_owned(),
            )
            .await?;

        let update_books = Query::update()
            .table(Recipes::Table)
            .values([(Recipes::Source, "book".into())])
            .and_where(Expr::col(Recipes::BookTitle).is_not_null())
            .to_owned();
        manager.exec_stmt(update_books).await?;

        let update_websites = Query::update()
            .table(Recipes::Table)
            .values([(Recipes::Source, "website".into())])
            .and_where(Expr::col(Recipes::WebsiteUrl).is_not_null())
            .to_owned();
        manager.exec_stmt(update_websites).await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Recipes::Table)
                    .modify_column(ColumnDef::new(Recipes::Source).string().not_null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        Ok(())
    }
}
