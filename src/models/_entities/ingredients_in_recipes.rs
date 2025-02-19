//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "ingredients_in_recipes")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    pub recipes_id: i32,
    pub ingredients_id: i32,
    pub quantities_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::ingredients::Entity",
        from = "Column::IngredientsId",
        to = "super::ingredients::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Ingredients,
    #[sea_orm(
        belongs_to = "super::quantities::Entity",
        from = "Column::QuantitiesId",
        to = "super::quantities::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Quantities,
    #[sea_orm(
        belongs_to = "super::recipes::Entity",
        from = "Column::RecipesId",
        to = "super::recipes::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Recipes,
}

impl Related<super::ingredients::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Ingredients.def()
    }
}

impl Related<super::quantities::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Quantities.def()
    }
}

impl Related<super::recipes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recipes.def()
    }
}
