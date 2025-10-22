use loco_rs::prelude::*;

use crate::models::ingredients::Ingredient;
use crate::models::storages::Storages;
use futures::TryStreamExt;

pub struct IngredientStorageLocation;
#[async_trait]
impl Task for IngredientStorageLocation {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "ingredient-storage-location".to_string(),
            detail: "Connects to a DB and allows setting the storage location one by one"
                .to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, _vars: &task::Vars) -> Result<()> {
        let storage_locations = Storages::all(&app_context.db).await?;

        let mut ingredients = Ingredient::find().stream(&app_context.db).await?;
        while let Some(i) = ingredients.try_next().await? {
            let i: crate::models::ingredients::ActiveModel = i.into();

            let stored_in: Option<_> = i.stored_in.into();

            println!(
                "{name}({id}) -> {stored_in:?}",
                name = i.name.unwrap(),
                id = i.id.unwrap(),
                stored_in = stored_in,
            );
        }

        Ok(())
    }
}
