//! `SeaORM` Entity, @generated by sea-orm-codegen 1.1.0

use std::ops::Deref;

use sea_orm::{entity::prelude::*, TryGetableFromJson};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "recipes")]
pub struct Model {
    pub created_at: DateTimeUtc,
    pub updated_at: DateTimeUtc,
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Text")]
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub book_title: Option<String>,
    pub book_page: Option<i32>,
    #[sea_orm(column_type = "Text", nullable)]
    pub website_url: Option<String>,
    #[sea_orm(column_type = "Text")]
    pub source: String,
    #[sea_orm(column_type = "Text")]
    pub tags: Tags,
    pub rating: i32,
    #[sea_orm(column_type = "Text", nullable)]
    pub notes: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Tags(Vec<String>);

impl TryGetableFromJson for Tags {}

impl std::convert::From<Tags> for sea_orm::Value {
    fn from(source: Tags) -> Self {
        dbg!(&source);
        sea_orm::Value::Json(
            serde_json::to_value(&source.0)
                .ok()
                .map(std::boxed::Box::new),
        )
    }
}

impl sea_orm::sea_query::ValueType for Tags {
    fn try_from(v: sea_orm::Value) -> Result<Self, sea_orm::sea_query::ValueTypeErr> {
        dbg!(&v);
        match v {
            sea_orm::Value::Json(Some(json)) => {
                let vs: Vec<String> =
                    serde_json::from_value(*json).map_err(|_| sea_orm::sea_query::ValueTypeErr)?;
                Ok(Tags(vs))
            }
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        "Text".to_string()
    }

    fn array_type() -> sea_orm::sea_query::ArrayType {
        sea_orm::sea_query::ArrayType::Json
    }

    fn column_type() -> sea_orm::sea_query::ColumnType {
        sea_orm::sea_query::ColumnType::Json
    }
}

impl Deref for Tags {
    type Target = Vec<String>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<Vec<String>> for Tags {
    fn from(value: Vec<String>) -> Self {
        Self(value)
    }
}

impl Tags {
    pub fn inner(&self) -> Vec<String> {
        self.0.clone()
    }
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
