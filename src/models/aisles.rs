pub use super::_entities::aisles::{ActiveModel, Entity, Model};
use sea_orm::{entity::prelude::*, FromQueryResult};
pub type Aisles = Entity;

#[derive(Debug, FromQueryResult)]
pub struct AisleRef {
    pub name: String,
    pub order: i16,
}

impl From<Model> for AisleRef {
    fn from(value: Model) -> Self {
        Self {
            name: value.name,
            order: value.order,
        }
    }
}

#[async_trait::async_trait]
impl ActiveModelBehavior for ActiveModel {
    async fn before_save<C>(self, _db: &C, insert: bool) -> std::result::Result<Self, DbErr>
    where
        C: ConnectionTrait,
    {
        if !insert && self.updated_at.is_unchanged() {
            let mut this = self;
            this.updated_at = sea_orm::ActiveValue::Set(chrono::Utc::now().into());
            Ok(this)
        } else {
            Ok(self)
        }
    }
}

// implement your read-oriented logic here
impl Model {}

// implement your write-oriented logic here
impl ActiveModel {}

// implement your custom finders, selectors oriented logic here
impl Entity {}
