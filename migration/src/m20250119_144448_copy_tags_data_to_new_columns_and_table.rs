use sea_orm_migration::{prelude::*, sea_orm::Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        // add all the relevant aisles
        run_sql(m.get_connection(), 
        r#"INSERT INTO aisles(id, name, "order") SELECT id, name, "order" from tags where is_aisle is true;"#,
        ).await?;

        // Set all the right aisles absed on the old "tags" that were really aisles 

        run_sql(m.get_connection(), 
            r#"
        UPDATE ingredients
            set aisle = a.id
            FROM tags_on_ingredients as t_o_i
            JOIN public.tags t on t.id = t_o_i.tag_id
            JOIN public.aisles a on t.name = a.name
            where t.is_aisle = true
                and ingredients.id = t_o_i.ingredient_id;
                "#,
        ).await?;
       
        // transfer all tags as an array onto the right ingredient
        run_sql(m.get_connection(), 
        r#"
                UPDATE ingredients SET tags=sub.tags
                  FROM (
                    SELECT i.id as id, array_agg(t.name) as tags
                    FROM ingredients i
                      JOIN tags_on_ingredients toi ON i.id = toi.ingredient_id
                      JOIN tags t ON t.id = toi.tag_id
                    GROUP BY i.id
                  ) AS sub
                WHERE ingredients.id = sub.id;
        "#,).await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        run_sql(m.get_connection(), 
            r#"
            UPDATE ingredients SET tags = ARRAY []::varchar[], aile = null;
            "#,
        ).await?;

        run_sql(m.get_connection(), 
            r#"
            DELETE FROM ailes;
            "#,
        ).await?;

        Ok(())
    }
}

async fn run_sql(conn: &impl ConnectionTrait, sql: &'static str) -> Result<(), DbErr> {
    let backend = conn.get_database_backend();
    let statement = Statement::from_string( backend, sql);
    conn.execute(statement).await?;

    Ok(())
}
