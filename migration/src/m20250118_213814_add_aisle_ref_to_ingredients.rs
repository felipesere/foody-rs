use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Ingredients {
    Table,
    Aisle,
}

#[derive(DeriveIden)]
enum Aisles {
    Table,
    Id,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Ingredients::Table)
                .add_column_if_not_exists(integer_null(Ingredients::Aisle))
                .add_foreign_key(
                    TableForeignKey::new()
                        .name("fk-ingredients-aisle")
                        .from_tbl(Ingredients::Table)
                        .from_col(Ingredients::Aisle)
                        .to_tbl(Aisles::Table)
                        .to_col(Aisles::Id),
                )
                .to_owned(),
        )
        .await?;

        // populate aisles with the previous ones
        // INSERT INTO aisles(id, name, "order") SELECT id, name, "order" from tags where is_aisle is true;
        //
        // populate new tags column in ingredeints:
        // UPDATE ingredients SET tags=sub.tags
        //   FROM (
        //            SELECT i.id as id, array_agg(t.name) as tags
        //            FROM ingredients i
        //                     JOIN tags_on_ingredients toi ON i.id = toi.ingredient_id
        //                     JOIN tags t ON t.id = toi.tag_id
        //            GROUP BY i.id
        //        ) AS sub
        //   WHERE ingredients.id = sub.id;
        //
        //
        //

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Ingredients::Table)
                .drop_foreign_key(Alias::new("fk-ingredients-aisle"))
                .drop_column(Ingredients::Aisle)
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}
