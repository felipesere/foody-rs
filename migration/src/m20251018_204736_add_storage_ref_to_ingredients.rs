use loco_rs::schema::{add_column, remove_column};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        add_column(
            m,
            "ingredients",
            "stored_in",
            loco_rs::schema::ColType::SmallUnsignedNull,
        )
        .await?;

        m.alter_table(
            Table::alter()
                .table(Alias::new("ingredients"))
                .add_foreign_key(
                    &TableForeignKey::new()
                        .name("fk_ingredients_storages_in")
                        .from_tbl(Alias::new("ingredients"))
                        .from_col(Alias::new("stored_in"))
                        .to_tbl(Alias::new("storages"))
                        .to_col(Alias::new("id"))
                        .on_delete(ForeignKeyAction::SetNull)
                        .on_update(ForeignKeyAction::NoAction)
                        .to_owned(),
                )
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Alias::new("ingredients"))
                .drop_foreign_key(Alias::new("fk_ingredients_storages_in"))
                .to_owned(),
        )
        .await?;
        remove_column(m, "ingredients", "stored_in").await?;
        Ok(())
    }
}
