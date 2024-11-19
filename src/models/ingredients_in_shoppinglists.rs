use sea_orm::{entity::prelude::*, ActiveValue};

pub use super::_entities::ingredients_in_shoppinglists::{ActiveModel, Column, Entity};
use super::_entities::tags;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

// TODO: Why are you here?!
pub async fn batch_insert_if_not_exists<'a, C: ConnectionTrait>(
    db: &'a C,
    values: &[String],
) -> Result<Vec<i32>, loco_rs::Error> {
    let tags = tags::Entity::find()
        .filter(tags::Column::Name.is_in(values))
        .all(db)
        .await?;

    let existing_tag_names: Vec<_> = tags.iter().map(|t| t.name.clone()).collect();
    let mut tag_ids: Vec<_> = tags.iter().map(|t| t.id).collect();

    let remaining: Vec<_> = values
        .iter()
        .filter(|name| !existing_tag_names.contains(name))
        .collect();

    for tag in remaining {
        let model = tags::ActiveModel {
            name: ActiveValue::Set(tag.to_owned()),
            is_aisle: ActiveValue::Set(false),
            ..Default::default()
        };
        let model = model.insert(db).await?;
        tag_ids.push(model.id);
    }

    Ok(tag_ids)
}
