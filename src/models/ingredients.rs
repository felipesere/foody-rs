use std::collections::HashSet;

use sea_orm::{entity::prelude::*, Statement};

pub use super::_entities::ingredients::{self, ActiveModel, Entity, Model};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

pub async fn all_tags(conn: &DatabaseConnection) -> Result<Vec<String>, loco_rs::Error> {
    let backend = conn.get_database_backend();

    let tags_statement = Statement::from_string(
        backend,
        r#"SELECT DISTINCT(unnest("tags")) as "tags" from ingredients;"#,
    );

    let results = conn.query_all(tags_statement).await?;

    let mut unique_tags: HashSet<String> = HashSet::default();
    for qr in results {
        let tag = qr.try_get("", "tags")?;
        unique_tags.insert(tag);
    }

    Ok(unique_tags.into_iter().collect())
}
