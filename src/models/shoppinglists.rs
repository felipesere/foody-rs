use std::collections::BTreeSet;

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

#[derive(Debug)]
pub struct ItemQuantity {
    pub quantity: Quantity,
    pub in_basket: bool,
    pub recipe_id: Option<i32>,
}

#[derive(Debug)]
pub struct Item {
    pub ingredient: Ingredient,
    pub quantities: Vec<ItemQuantity>,
    pub note: Option<String>,
}

#[derive(Debug)]
pub struct FullShoppinglist {
    pub list: Shoppinglist,
    pub items: Vec<Item>,
}

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
                "r1"."tags" as "i_tags",
                "r0"."in_basket" as "iis_in_basket",
                "r0"."recipe_id" as "iis_recipe_id",
                "r0"."note" as "iis_note",
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

            let recipe_id = row.try_get::<Option<i32>>("iis_", "recipe_id")?;
            let note = row.try_get::<Option<String>>("iis_", "note")?;

            if result.is_empty() || result[result.len() - 1].list.id != list.id {
                result.push(FullShoppinglist {
                    list,
                    items: Vec::new(),
                });
            };

            let Some(ingredient) = ingredient else {
                continue;
            };

            let Some(quantity) = quantity else { continue };
            let last_list_idx = result.len();
            let list = &mut result[last_list_idx - 1];
            let items = &mut list.items;

            let item_idx = items
                .iter()
                .position(|item| item.ingredient.id == ingredient.id);
            let item_quantity = ItemQuantity {
                quantity,
                recipe_id,
                in_basket: in_basket.unwrap_or(false),
            };

            if let Some(item_idx) = item_idx {
                // Thank you _JOINS_, we've seen this quantity already...
                if items[item_idx]
                    .quantities
                    .iter()
                    .any(|q| q.quantity.id != item_quantity.quantity.id)
                {
                    items[item_idx].quantities.push(item_quantity);
                }
            } else {
                items.push(Item {
                    ingredient,
                    quantities: vec![item_quantity],
                    note,
                });
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
                "r1"."tags" as "i_tags",
                "r0"."in_basket" as "iis_in_basket",
                "r0"."recipe_id" as "iis_recipe_id",
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
            let recipe_id = row.try_get::<Option<i32>>("iis_", "recipe_id")?;

            if result.is_empty() || result[result.len() - 1].list.id != list.id {
                result.push(FullShoppinglist {
                    list,
                    items: vec![],
                });
            };

            let Some(ingredient) = ingredient else {
                continue;
            };
            let Some(quantity) = quantity else { continue };
            let last_list_idx = result.len();
            let list = &mut result[last_list_idx - 1];
            let items = &mut list.items;
            let item_quantity = ItemQuantity {
                quantity,
                in_basket: in_basket.unwrap_or(false),
                recipe_id,
            };

            let idx = items.iter().position(|o| o.ingredient.id == ingredient.id);
            if let Some(idx) = idx {
                items[idx].quantities.push(item_quantity);
            } else {
                items.push(Item {
                    ingredient,
                    quantities: vec![item_quantity],
                    note: None,
                })
            };
        }
        Ok(result)
    }
}
