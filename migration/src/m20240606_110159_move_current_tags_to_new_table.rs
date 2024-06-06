use std::collections::HashMap;

use sea_orm_migration::{prelude::*, sea_orm::Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum TagsOnIngredients {
    Table,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let backend = manager.get_database_backend();
        let conn = manager.get_connection();

        let select_ingredients_tags =
            Statement::from_string(backend, r#"SELECT id, tags FROM ingredients"#);

        let values = conn.query_all(select_ingredients_tags).await?;

        let mut tagged: HashMap<String, Vec<i32>> = HashMap::new();
        for query_result in values {
            let id: i32 = query_result.try_get_by("id")?;
            let tags: Vec<String> = query_result.try_get_by("tags")?;

            for tag in tags {
                tagged.entry(tag).or_default().push(id);
            }
        }

        for (tag, ingredients) in tagged {
            let tag_statement = Statement::from_sql_and_values(
                backend,
                r#"INSERT INTO tags (name, is_aisle) VALUES ($1, $2) ON CONFLICT DO NOTHING"#,
                vec![tag.clone().into(), false.into()],
            );
            conn.execute(tag_statement).await?;
            let query_tag_id = Statement::from_sql_and_values(
                backend,
                r#"
                SELECT id FROM tags WHERE name = $1
                "#,
                vec![Value::String(Some(Box::new(tag)))],
            );
            let tag_id: i32 = conn
                .query_one(query_tag_id)
                .await?
                .expect("previously inserted tag not found")
                .try_get_by("id")?;

            let columns: Vec<Alias> = ["tag_id", "ingredient_id"]
                .into_iter()
                .map(Alias::new)
                .collect();

            let mut stmt = Query::insert();
            stmt.into_table(TagsOnIngredients::Table).columns(columns);
            for ingredient_id in ingredients {
                stmt.values_panic(vec![tag_id.into(), ingredient_id.into()]);
            }
            conn.execute(backend.build(&stmt)).await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let backend = manager.get_database_backend();
        manager
            .get_connection()
            .execute(Statement::from_string(
                backend,
                r#"DELETE FROM tags_on_ingredients;"#,
            ))
            .await?;

        manager
            .get_connection()
            .execute(Statement::from_string(backend, r#"DELETE FROM tags;"#))
            .await?;

        Ok(())
    }
}
