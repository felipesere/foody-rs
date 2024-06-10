use sea_orm::entity::prelude::*;

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
