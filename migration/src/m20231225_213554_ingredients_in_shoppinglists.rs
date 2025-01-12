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
                table_auto(IngredientsInShoppinglists::Table)
                    .col(pk_auto(IngredientsInShoppinglists::Id).borrow_mut())
                    .col(boolean(IngredientsInShoppinglists::InBasket).borrow_mut())
                    .col(integer(IngredientsInShoppinglists::ShoppinglistsId).borrow_mut())
                    .col(integer(IngredientsInShoppinglists::IngredientsId).borrow_mut())
                    .col(integer(IngredientsInShoppinglists::QuantitiesId).borrow_mut())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-shoppinglists")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::ShoppinglistsId,
                            )
                            .to(Shoppinglists::Table, Shoppinglists::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-ingredients")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::IngredientsId,
                            )
                            .to(Ingredients::Table, Ingredients::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredients_in_shoppinglists-quantities")
                            .from(
                                IngredientsInShoppinglists::Table,
                                IngredientsInShoppinglists::QuantitiesId,
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
            .drop_table(
                Table::drop()
                    .table(IngredientsInShoppinglists::Table)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum IngredientsInShoppinglists {
    Table,
    Id,
    InBasket,
    ShoppinglistsId,
    IngredientsId,
    QuantitiesId,
}

#[derive(DeriveIden)]
enum Shoppinglists {
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
