use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum IngredientsInShoppinglists {
    Table,
    RecipeId,
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
            .alter_table(
                Table::alter()
                    .table(IngredientsInShoppinglists::Table)
                    .add_column_if_not_exists(integer_null(IngredientsInShoppinglists::RecipeId))
                    .table(IngredientsInShoppinglists::Table)
                    .add_foreign_key(
                        TableForeignKey::new()
                            .name("fk-ingredient_in_recipes-recipe-id")
                            .from_tbl(IngredientsInShoppinglists::Table)
                            .from_col(IngredientsInShoppinglists::RecipeId)
                            .to_tbl(Recipes::Table)
                            .to_col(Recipes::Id),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(IngredientsInShoppinglists::Table)
                    .drop_column(Recipes::Id)
                    .drop_foreign_key(Alias::new("fk-ingredient_in_recipes-recipe-id"))
                    .to_owned(),
            )
            .await
    }
}
