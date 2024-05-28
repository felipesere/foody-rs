//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.6

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "ingredients")]
pub struct Model {
    pub created_at: DateTime,
    pub updated_at: DateTime,
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
    pub tags: Vec<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::ingredients_in_recipes::Entity")]
    IngredientsInRecipes,
    #[sea_orm(has_many = "super::ingredients_in_shoppinglists::Entity")]
    IngredientsInShoppinglists,
}

impl Related<super::ingredients_in_recipes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::IngredientsInRecipes.def()
    }
}

impl Related<super::ingredients_in_shoppinglists::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::IngredientsInShoppinglists.def()
    }
}
