use loco_rs::schema::{drop_table, remove_reference};
use sea_orm::Statement;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "tags_on_ingredients").await?;
        drop_table(m, "tags").await?;

        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        run_sql(
            m.get_connection(),
            r#"
            create table public.tags_on_ingredients
            (
                created_at    timestamp default CURRENT_TIMESTAMP not null,
                updated_at    timestamp default CURRENT_TIMESTAMP not null,
                id            serial primary key,
                tag_id        integer                             not null
                    constraint "fk-tags_on_ingredients-tags"
                        references public.tags
                        on update cascade on delete cascade,
                ingredient_id integer                             not null
                    constraint "fk-tags_on_ingredients-ingredients"
                        references public.ingredients
                        on update cascade on delete cascade
            );
        "#,
        )
        .await?;

        run_sql(
            m.get_connection(),
            r#"
            create table public.tags (
              created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
              updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
              id integer primary key not null default nextval('tags_id_seq'::regclass),
              name character varying not null,
              "order" integer,
              is_aisle boolean not null
            );
            create unique index tags_name_key on tags using btree (name);
            create unique index tags_order_key on tags using btree ("order");
            "#,
        )
        .await?;

        Ok(())
    }
}

async fn run_sql(conn: &impl ConnectionTrait, sql: &'static str) -> Result<(), DbErr> {
    let backend = conn.get_database_backend();
    let statement = Statement::from_string(backend, sql);
    conn.execute(statement).await?;

    Ok(())
}
