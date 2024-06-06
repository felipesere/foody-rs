//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.6

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::tags_on_ingredients;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "ingredients")]
pub struct Model {
    pub created_at: DateTime,
    pub updated_at: DateTime,
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(unique)]
    pub name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::ingredients_in_recipes::Entity")]
    IngredientsInRecipes,
    #[sea_orm(has_many = "super::ingredients_in_shoppinglists::Entity")]
    IngredientsInShoppinglists,
    #[sea_orm(has_many = "super::tags_on_ingredients::Entity")]
    TagsOnIngredients,
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

impl Related<super::tags_on_ingredients::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TagsOnIngredients.def()
    }
}

#[derive(Debug)]
pub struct IngredientToTags;

impl Linked for IngredientToTags {
    type FromEntity = Entity;

    type ToEntity = super::tags::Entity;

    fn link(&self) -> Vec<sea_orm::LinkDef> {
        vec![
            self::Relation::TagsOnIngredients.def(),
            tags_on_ingredients::Relation::Tags.def(),
        ]
    }
}
