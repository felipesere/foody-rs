#![allow(clippy::unused_async)]

use loco_rs::{controller::middleware, prelude::*};
use serde::Serialize;
use sea_orm::{Statement, DbBackend, FromQueryResult};
use sea_orm::entity::prelude::*;

use crate::models::ingredients::Model as Ingredient;
use crate::models::quantities::Model as Quantity;
use crate::models::{
    shoppinglists::Model as Shoppinglists,
    users,
};

#[derive(Serialize)]
pub struct ShoppinglistsResponse {
    shoppinglists: Vec<ShoppinglistResponse>,
}

#[derive(Serialize, Clone, Debug)]
struct QuantityResponse {
    id: i32,
    unit: String,
    value: Option<i32>,
    text: Option<String>,

}

impl From<Quantity> for QuantityResponse {
    fn from(value: Quantity) -> Self {
        QuantityResponse {
            id: value.id,
            unit: value.unit,
            value: value.value,
            text: value.text,
        }
    }
}


#[derive(Serialize, Clone, Debug)]
struct IngredientResponse {
    id: i32,
    name: String,
    quantities: Vec<QuantityResponse>,
}

#[derive(Serialize, Clone, Debug)]
struct ShoppinglistResponse {
    id: i32,
    name: String,
    ingredients: Vec<IngredientResponse>,
    last_updated: String,
}

impl From<Shoppinglists> for ShoppinglistResponse {
    fn from(value: Shoppinglists) -> Self {
        ShoppinglistResponse {
            id: value.id,
            name: value.name,
            ingredients: Vec::new(),
            last_updated: value.updated_at.format("%Y-%m-%dT%H:%M:%S").to_string(),
        }
    }
}

impl From<Ingredient> for IngredientResponse {
    fn from(value: Ingredient) -> Self {
        IngredientResponse {
            id: value.id,
            name: value.name,
            quantities: Vec::new(),
        }
    }
}

pub async fn all_shoppinglists(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<axum::Json<ShoppinglistsResponse>> {
    // check auth
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let s = Statement::from_string(DbBackend::Postgres, r#"
        SELECT
          "shoppinglists"."created_at" AS "s_created_at",
          "shoppinglists"."updated_at" AS "s_updated_at",
          "shoppinglists"."id" AS "s_id",
          "shoppinglists"."name" AS "s_name",
          "r1"."created_at" AS "i_created_at",
          "r1"."updated_at" AS "i_updated_at",
          "r1"."id" AS "i_id",
          "r1"."name" AS "i_name",
          "q"."id" AS "q_id",
          "q"."created_at" AS "q_created_at",
          "q"."updated_at" AS "q_updated_at",
          "q"."unit" AS "q_unit",
          "q"."value" AS "q_value",
          "q"."text" AS "q_text"
        FROM
          "shoppinglists"
          JOIN "ingredients_in_shoppinglists" AS "r0" ON "r0"."shoppinglists_id" = "shoppinglists"."id"
          JOIN "ingredients" AS "r1" ON "r0"."ingredients_id" = "r1"."id"
          JOIN "quantities" AS "q" ON "r0"."quantities_id" = "q".id
          ORDER BY
            "shoppinglists"."id" ASC,
            "r1"."id" ASC,
            "q"."id" ASC
        "#);

    let rows = &ctx.db.query_all(s.clone()).await.unwrap();

    let mut shoppinglists: Vec<ShoppinglistResponse> = Vec::new();
    for row in rows {

        let new_list: ShoppinglistResponse = Shoppinglists::from_query_result(row, "s_")?.into();

        let last = shoppinglists.len();
        let list = if !shoppinglists.is_empty() && shoppinglists[last -1].id == new_list.id {
            &mut shoppinglists[last - 1]
        } else {
            shoppinglists.push(new_list);
            let last = shoppinglists.len() - 1;
            &mut shoppinglists[last]
        };

        let i: IngredientResponse = Ingredient::from_query_result(row, "i_")?.into();

        let idx = list.ingredients.iter().position(|o| o.id == i.id);
        let ing = if let Some(idx) = idx {
            &mut list.ingredients[idx]
        } else {
            list.ingredients.push(i);
            let last = list.ingredients.len() -1;
            &mut list.ingredients[last]
        };

        let q: QuantityResponse = Quantity::from_query_result(row, "q_")?.into();
        ing.quantities.push(q);
    }

    format::json(ShoppinglistsResponse {
        shoppinglists,
    })
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("shoppinglists")
        .add("/", get(all_shoppinglists))
}
