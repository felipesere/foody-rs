//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.6

use sea_orm::{entity::prelude::*, ActiveValue};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "tags")]
pub struct Model {
    pub created_at: DateTime,
    pub updated_at: DateTime,
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    #[sea_orm(unique)]
    pub order: Option<i32>,
    pub is_aisle: bool,
}

pub async fn batch_insert_if_not_exists<'a, C: ConnectionTrait>(
    db: &'a C,
    values: &[String],
) -> Result<Vec<i32>, loco_rs::Error> {
    let tags = super::tags::Entity::find()
        .filter(super::tags::Column::Name.is_in(values))
        .all(db)
        .await?;

    let existing_tag_names: Vec<_> = tags.iter().map(|t| t.name.clone()).collect();
    let mut tag_ids: Vec<_> = tags.iter().map(|t| t.id).collect();

    let remaining: Vec<_> = values
        .iter()
        .filter(|name| !existing_tag_names.contains(name))
        .collect();

    for tag in remaining {
        let model = ActiveModel {
            name: ActiveValue::Set(tag.to_owned()),
            is_aisle: ActiveValue::Set(false),
            ..Default::default()
        };
        let model = model.insert(db).await?;
        tag_ids.push(model.id);
    }

    Ok(tag_ids)
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::tags_on_ingredients::Entity")]
    TagsOnIngredients,
}

impl Related<super::tags_on_ingredients::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TagsOnIngredients.def()
    }
}