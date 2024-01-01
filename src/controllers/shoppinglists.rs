use axum::extract;
use loco_rs::{controller::middleware, prelude::*};
use sea_orm::ActiveValue::Set;
use serde::{Serialize, Deserialize};

use crate::models::ingredients::Model as Ingredient;
use crate::models::quantities::Model as Quantity;
use crate::models::shoppinglists;
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
    #[serde(skip_serializing_if = "Option::is_none")]
    value: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
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
pub struct ShoppinglistResponse {
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

    let mut shoppinglists = Vec::new();
    for (list, ingredients) in Shoppinglists::find_all(&ctx.db).await? {
        let mut shoppinglist = ShoppinglistResponse::from(list);
        for (ingredient, quantities) in ingredients {
            let mut converted_ingredient = IngredientResponse::from(ingredient);

            converted_ingredient.quantities = quantities.into_iter().map(QuantityResponse::from).collect();
            shoppinglist.ingredients.push(converted_ingredient);

        }
        shoppinglists.push(shoppinglist);
    }

    format::json(ShoppinglistsResponse {
        shoppinglists,
    })
}

#[derive(Deserialize, Clone, Debug)]
pub struct NewShoppinglist {
	name: String,
}

pub async fn create_shoppinglist(
    _auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewShoppinglist>,
) -> Result<axum::Json<ShoppinglistResponse>> {

    let new_list = shoppinglists::ActiveModel {
        name: Set(params.name),
        ..Default::default()
    };
    let list = new_list.insert(&ctx.db).await?;

    format::json(ShoppinglistResponse::from(list))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("shoppinglists")
        .add("/", get(all_shoppinglists))
        .add("/", post(create_shoppinglist))
}
