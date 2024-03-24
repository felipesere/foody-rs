use loco_rs::model::ModelError;
use sea_orm::{
    ActiveModelBehavior, ConnectionTrait, DatabaseConnection, DbBackend, FromQueryResult, Statement,
};

use crate::models::ingredients::Model as Ingredient;
use crate::models::quantities::Model as Quantity;

pub use super::_entities::shoppinglists::{
    self, ActiveModel, Entity, Model as Shoppinglist, Relation,
};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}
type FullShoppinglist = (
    Shoppinglist,
    Vec<(Ingredient, Vec<(bool, Quantity, Option<u32>)>)>,
);

impl Shoppinglist {
    pub(crate) async fn find_one(
        db: &DatabaseConnection,
        id: u32,
    ) -> Result<Option<FullShoppinglist>, ModelError> {
        let s = Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            select
                "shoppinglists"."created_at" as "s_created_at",
                "shoppinglists"."updated_at" as "s_updated_at",
                "shoppinglists"."id" as "s_id",
                "shoppinglists"."name" as "s_name",
                "r1"."created_at" as "i_created_at",
                "r1"."updated_at" as "i_updated_at",
                "r1"."id" as "i_id",
                "r1"."name" as "i_name",
                "r0"."in_basket" as "iis_in_basket",
                "r0"."recipe_id" as "iss_recipe_id",
                "q"."id" as "q_id",
                "q"."created_at" as "q_created_at",
                "q"."updated_at" as "q_updated_at",
                "q"."unit" as "q_unit",
                "q"."value" as "q_value",
                "q"."text" as "q_text"
            from "shoppinglists"
            left join
                "ingredients_in_shoppinglists" as "r0"
                on "r0"."shoppinglists_id" = "shoppinglists"."id"
            left join "ingredients" as "r1" on "r0"."ingredients_id" = "r1"."id"
            left join "quantities" as "q" on "r0"."quantities_id" = "q".id
            where "shoppinglists"."id" = $1
            order by "shoppinglists"."id" asc, "r1"."id" asc, "q"."id" asc
                "#,
            vec![sea_orm::Value::Unsigned(Some(id))],
        );

        let rows = &db.query_all(s).await?;

        let mut result: Vec<FullShoppinglist> = Vec::new();
        for row in rows {
            let list = Self::from_query_result(row, "s_")?;
            let ingredient = Ingredient::from_query_result_optional(row, "i_")?;
            let quantity = Quantity::from_query_result_optional(row, "q_")?;
            let in_basket = row.try_get::<Option<bool>>("iis_", "in_basket")?;
            let recipe_id = row.try_get::<Option<u32>>("iis_", "recipe_id")?;

            if result.is_empty() || result[result.len() - 1].0.id != list.id {
                result.push((list, Vec::new()));
            };

            let Some(ingredient) = ingredient else {
                continue;
            };
            let Some(quantity) = quantity else { continue };
            let last_list_idx = result.len();
            let list = &mut result[last_list_idx - 1];
            let ingredients = &mut list.1;

            let idx = ingredients.iter().position(|o| o.0.id == ingredient.id);
            let item = (in_basket.unwrap_or(false), quantity, recipe_id);
            if let Some(idx) = idx {
                ingredients[idx].1.push(item);
            } else {
                ingredients.push((ingredient, vec![item]));
            };
        }
        Ok(Some(result.remove(0)))
    }

    /// Retrieves all possible shoppinglists
    ///
    /// # Errors
    /// See [`ModelError`]
    pub async fn find_all(db: &DatabaseConnection) -> Result<Vec<FullShoppinglist>, ModelError> {
        let s = Statement::from_string(
            DbBackend::Postgres,
            r#"
            select
                "shoppinglists"."created_at" as "s_created_at",
                "shoppinglists"."updated_at" as "s_updated_at",
                "shoppinglists"."id" as "s_id",
                "shoppinglists"."name" as "s_name",
                "r1"."created_at" as "i_created_at",
                "r1"."updated_at" as "i_updated_at",
                "r1"."id" as "i_id",
                "r1"."name" as "i_name",
                "r0"."in_basket" as "iis_in_basket",
                "r0"."recipe_id" as "iss_recipe_id",
                "q"."id" as "q_id",
                "q"."created_at" as "q_created_at",
                "q"."updated_at" as "q_updated_at",
                "q"."unit" as "q_unit",
                "q"."value" as "q_value",
                "q"."text" as "q_text"
            from "shoppinglists"
            left join
                "ingredients_in_shoppinglists" as "r0"
                on "r0"."shoppinglists_id" = "shoppinglists"."id"
            left join "ingredients" as "r1" on "r0"."ingredients_id" = "r1"."id"
            left join "quantities" as "q" on "r0"."quantities_id" = "q".id
            order by "shoppinglists"."id" asc, "r1"."id" asc, "q"."id" asc
                "#,
        );

        let rows = &db.query_all(s).await?;

        let mut result: Vec<FullShoppinglist> = Vec::new();
        for row in rows {
            let list = Self::from_query_result(row, "s_")?;
            let ingredient = Ingredient::from_query_result_optional(row, "i_")?;
            let quantity = Quantity::from_query_result_optional(row, "q_")?;
            let in_basket = row.try_get::<Option<bool>>("iis_", "in_basket")?;
            let recipe_id = row.try_get::<Option<u32>>("iis_", "recipe_id")?;

            if result.is_empty() || result[result.len() - 1].0.id != list.id {
                result.push((list, Vec::new()));
            };

            let Some(ingredient) = ingredient else {
                continue;
            };
            let Some(quantity) = quantity else { continue };
            let last_list_idx = result.len();
            let list = &mut result[last_list_idx - 1];
            let ingredients = &mut list.1;
            let item = (in_basket.unwrap_or(false), quantity, recipe_id);

            let idx = ingredients.iter().position(|o| o.0.id == ingredient.id);
            if let Some(idx) = idx {
                ingredients[idx].1.push(item);
            } else {
                ingredients.push((ingredient, vec![item]));
            };
        }
        Ok(result)
    }
}
