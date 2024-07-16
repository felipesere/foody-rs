use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum TagsOnRecipes {
    Table,
    Id,
    TagId,
    RecipeId,
}

#[derive(DeriveIden)]
enum Tags {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Id,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(TagsOnRecipes::Table)
                    .col(pk_auto(TagsOnRecipes::Id))
                    .col(integer(TagsOnRecipes::TagId))
                    .col(integer(TagsOnRecipes::RecipeId))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-tags")
                            .from(TagsOnRecipes::Table, TagsOnRecipes::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-tags_on_ingredients-ingredients")
                            .from(TagsOnRecipes::Table, TagsOnRecipes::RecipeId)
                            .to(Recipes::Table, Recipes::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TagsOnRecipes::Table).to_owned())
            .await
    }
}
