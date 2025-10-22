use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.get_connection()
            .execute_unprepared(
                r#"
        INSERT INTO storages (name, "order")
            VALUES
                ('fridge', 1),
                ('freezer', 2),
                ('top pantry', 3),
                ('bottom pantry', 4),
                ('fruits', 5),
                ('bread & tea', 6);
        "#,
            )
            .await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.truncate_table(
            Table::truncate()
                .table(Alias::new("storages").to_owned())
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}
