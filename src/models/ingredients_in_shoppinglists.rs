use sea_orm::entity::prelude::*;

pub use super::_entities::ingredients_in_shoppinglists::{ActiveModel, Column, Entity};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}
