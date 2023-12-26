use sea_orm::entity::prelude::*;

pub use super::_entities::ingredients::{self, ActiveModel, Entity, Model};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}
