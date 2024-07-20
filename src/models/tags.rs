use super::_entities::tags::ActiveModel;
use super::_entities::tags::Entity;
use migration::OnConflict;
use sea_orm::entity::prelude::*;
use sea_orm::ActiveValue;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

impl Entity {
    pub async fn upsert(
        db: &impl ConnectionTrait,
        name: String,
    ) -> Result<super::_entities::tags::Model, sea_orm::DbErr> {
        let tag_model = ActiveModel {
            name: ActiveValue::set(name.clone()),
            is_aisle: ActiveValue::set(false),
            ..Default::default()
        };

        Entity::insert(tag_model)
            .on_conflict(
                OnConflict::column(super::_entities::tags::Column::Name)
                    .value(super::_entities::tags::Column::Name, name)
                    .to_owned(),
            )
            .exec_with_returning(db)
            .await
            .inspect_err(|e| println!("The error when upserting was: {e}"))
    }
}
