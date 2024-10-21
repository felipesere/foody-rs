use sea_orm_migration::{prelude::*, sea_orm::Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // let backend = manager.get_database_backend();
        // let rename_fk = Statement::from_string(
        //     backend,
        //     r#"ALTER TABLE tags_on_recipes RENAME CONSTRAINT "fk-tags_on_ingredients-ingredients" TO "fk-tags_on_recipes-recipes""#,
        // );
        // manager.get_connection().execute(rename_fk).await?;

        // let rename_fk = Statement::from_string(
        //     backend,
        //     r#"ALTER TABLE tags_on_recipes RENAME CONSTRAINT "fk-tags_on_ingredients-tags" TO "fk-tags_on_recipes-tags""#,
        // );
        // manager.get_connection().execute(rename_fk).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let backend = manager.get_database_backend();
        let rename_fk = Statement::from_string(
            backend,
            r#"ALTER TABLE tags_on_recipes RENAME CONSTRAINT "fk-tags_on_recipes-recipes" TO "fk-tags_on_ingredients-ingredients""#,
        );
        manager.get_connection().execute(rename_fk).await?;

        let rename_fk = Statement::from_string(
            backend,
            r#"ALTER TABLE tags_on_recipes RENAME CONSTRAINT "fk-tags_on_recipes-tags" TO "fk-tags_on_ingredients-tags""#,
        );
        manager.get_connection().execute(rename_fk).await?;

        Ok(())
    }
}
