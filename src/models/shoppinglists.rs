use loco_rs::model::ModelError;
use sea_orm::{
    ActiveModelBehavior, DatabaseConnection, DbBackend, Linked, RelationDef, RelationTrait,
    Statement, ConnectionTrait, FromQueryResult,
};

use crate::models::ingredients::Model as Ingredient;
use crate::models::quantities::Model as Quantity;

pub use super::_entities::shoppinglists::{self, ActiveModel, Entity, Model, Relation};
use super::ingredients::ingredients;
use crate::models::_entities::ingredients_in_shoppinglists;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

impl Model {
    pub async fn find_all(db: &DatabaseConnection) -> Result<Vec<(Model, Vec<(Ingredient, Vec<Quantity>)>)>, ModelError> {
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
                "q"."id" as "q_id",
                "q"."created_at" as "q_created_at",
                "q"."updated_at" as "q_updated_at",
                "q"."unit" as "q_unit",
                "q"."value" as "q_value",
                "q"."text" as "q_text"
            from "shoppinglists"
            join
                "ingredients_in_shoppinglists" as "r0"
                on "r0"."shoppinglists_id" = "shoppinglists"."id"
            join "ingredients" as "r1" on "r0"."ingredients_id" = "r1"."id"
            join "quantities" as "q" on "r0"."quantities_id" = "q".id
            order by "shoppinglists"."id" asc, "r1"."id" asc, "q"."id" asc
                "#,
        );

        let rows = &db.query_all(s.clone()).await?;

        let mut result: Vec<(Model, Vec<(Ingredient, Vec<Quantity>)>)> = Vec::new();
        for row in rows {
            let list = Model::from_query_result(row, "s_")?;
            let ingredient = Ingredient::from_query_result(row, "i_")?;
            let quantity = Quantity::from_query_result(row, "q_")?;

            if result.is_empty() || result[result.len() - 1].0.id != list.id {
                result.push((list, Vec::new()));
            };
            let last_list_idx = result.len();
            let list = &mut result[last_list_idx - 1];
            let ingredients = &mut list.1;

            let idx = ingredients.iter().position(|o| o.0.id == ingredient.id);
            if let Some(idx) = idx {
                ingredients[idx].1.push(quantity);
            } else {
                ingredients.push((ingredient, vec![quantity]));
            };
        }
        Ok(result)
    }
}

pub struct ShoppinglistIngredients;

impl Linked for ShoppinglistIngredients {
    type FromEntity = shoppinglists::Entity;

    type ToEntity = ingredients::Entity;

    fn link(&self) -> Vec<RelationDef> {
        vec![
            ingredients_in_shoppinglists::Relation::Shoppinglists
                .def()
                .rev(),
            ingredients_in_shoppinglists::Relation::Ingredients.def(),
        ]
    }
}
