use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(TagsOnIngredients::Table)
                    .col(pk_auto(TagsOnIngredients::Id))
                    .col(integer(TagsOnIngredients::TagId))
                    .col(integer(TagsOnIngredients::IngredientId))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-tags")
                            .from(TagsOnIngredients::Table, TagsOnIngredients::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-ingredients")
                            .from(TagsOnIngredients::Table, TagsOnIngredients::IngredientId)
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TagsOnIngredients::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum TagsOnIngredients {
    Table,
    Id,
    TagId,
    IngredientId,
}

#[derive(DeriveIden)]
enum Tags {
    Table,
    Id,
}
#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Id,
}
