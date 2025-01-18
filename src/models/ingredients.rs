use std::collections::HashSet;

use sea_orm::{entity::prelude::*, Statement};

pub use super::_entities::ingredients::{self, ActiveModel, Entity, Model};
use super::_entities::tags;
pub use super::_entities::tags_on_ingredients;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

#[derive(Debug)]
pub struct IngredientToTags;

impl Linked for IngredientToTags {
    type FromEntity = Entity;

    type ToEntity = tags::Entity;

    fn link(&self) -> Vec<sea_orm::LinkDef> {
        vec![
            ingredients::Relation::TagsOnIngredients.def(),
            tags_on_ingredients::Relation::Tags.def(),
        ]
    }
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
