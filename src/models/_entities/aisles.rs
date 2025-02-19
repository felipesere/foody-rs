//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "aisles")]
pub struct Model {
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub order: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::ingredients::Entity")]
    Ingredients,
}

impl Related<super::ingredients::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Ingredients.def()
    }
}
