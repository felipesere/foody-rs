//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use sea_orm::entity::prelude::*;
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

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::tags_on_ingredients::Entity")]
    TagsOnIngredients,
    #[sea_orm(has_many = "super::tags_on_recipes::Entity")]
    TagsOnRecipes,
}

impl Related<super::tags_on_ingredients::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TagsOnIngredients.def()
    }
}

impl Related<super::tags_on_recipes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::TagsOnRecipes.def()
    }
}
