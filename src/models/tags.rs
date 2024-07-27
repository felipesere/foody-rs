use super::_entities::tags::ActiveModel;
use super::_entities::tags::Column;
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

        Self::insert(tag_model)
            .on_conflict(
                OnConflict::column(super::_entities::tags::Column::Name)
                    .value(super::_entities::tags::Column::Name, name)
                    .to_owned(),
            )
            .exec_with_returning(db)
            .await
    }

    pub async fn batch_upsert<'a, C: ConnectionTrait>(
        db: &'a C,
        values: &[String],
    ) -> Result<Vec<super::_entities::tags::Model>, sea_orm::DbErr> {
        let mut tags = Self::find()
            .filter(Column::Name.is_in(values))
            .all(db)
            .await?;

        let existing_tag_names: Vec<_> = tags.iter().map(|t| t.name.clone()).collect();

        let remaining: Vec<_> = values
            .iter()
            .filter(|name| !existing_tag_names.contains(name))
            .collect();

        for tag in remaining {
            let model = ActiveModel {
                name: ActiveValue::Set(tag.to_owned()),
                is_aisle: ActiveValue::Set(false),
                ..Default::default()
            };
            let model = model.insert(db).await?;
            tags.push(model);
        }

        Ok(tags)
    }
}
