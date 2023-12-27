use sea_orm::{ActiveModelBehavior, Linked, RelationDef, RelationTrait};

pub use super::_entities::shoppinglists::{self, ActiveModel, Entity, Model, Relation};
use super::ingredients::ingredients;
use crate::models::_entities::ingredients_in_shoppinglists;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

pub struct ShoppinglistIngredients;

impl Linked for ShoppinglistIngredients {
    type FromEntity = shoppinglists::Entity;

    type ToEntity = ingredients::Entity;

    fn link(&self) -> Vec<RelationDef> {
        vec![
            ingredients_in_shoppinglists::Relation::Shoppinglists
                .def()
                .rev(),
            ingredients_in_shoppinglists::Relation::Ingredients.def(),
        ]
    }
}
