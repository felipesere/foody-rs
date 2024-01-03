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
                table_auto(IngredientsInRecipes::Table)
                    .col(pk_auto(IngredientsInRecipes::Id).borrow_mut())
                    .col(integer(IngredientsInRecipes::RecipesId).borrow_mut())
                    .col(integer(IngredientsInRecipes::IngredientsId).borrow_mut())
                    .col(integer(IngredientsInRecipes::QuantitiesId).borrow_mut())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-recipes")
                            .from(IngredientsInRecipes::Table, IngredientsInRecipes::RecipesId)
                            .to(Recipes::Table, Recipes::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-ingredients")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_recipes-quantities")
                            .from(
                                IngredientsInRecipes::Table,
                                IngredientsInRecipes::QuantitiesId,
                            )
                            .to(Quantities::Table, Quantities::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(IngredientsInRecipes::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum IngredientsInRecipes {
    Table,
    Id,
    RecipesId,
    IngredientsId,
    QuantitiesId,
}

#[derive(DeriveIden)]
enum Recipes {
    Table,
    Id,
}
#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Id,
}
#[derive(DeriveIden)]
enum Quantities {
    Table,
    Id,
}
