use axum::extract;
use loco_rs::{controller::middleware, prelude::*};
use sea_orm::entity::ColumnTrait;
use sea_orm::ActiveValue::{self, Set};
use sea_orm::{Condition, QueryFilter, TransactionTrait, Value};
use serde::{Deserialize, Serialize};

use crate::models::_entities::ingredients_in_shoppinglists;
use crate::models::ingredients::ingredients::Column;
use crate::models::ingredients::{self, Model as Ingredient};
use crate::models::quantities::{self, Model as Quantity};
use crate::models::shoppinglists;
use crate::models::{shoppinglists::Model as Shoppinglists, users};

#[derive(Serialize)]
pub struct ShoppinglistsResponse {
    shoppinglists: Vec<ShoppinglistResponse>,
}

#[derive(Serialize, Clone, Debug)]
pub struct QuantityResponse {
    pub id: i32,
    pub unit: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

impl From<Quantity> for QuantityResponse {
    fn from(value: Quantity) -> Self {
        Self {
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
    in_basket: bool,
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
        Self {
            id: value.id,
            name: value.name,
            ingredients: Vec::new(),
            last_updated: value.updated_at.format("%Y-%m-%dT%H:%M:%S").to_string(),
        }
    }
}

impl From<Ingredient> for IngredientResponse {
    fn from(value: Ingredient) -> Self {
        Self {
            id: value.id,
            name: value.name,
            quantities: Vec::new(),
            in_basket: false,
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
        for (ingredient, quantities, in_basket) in ingredients {
            let mut converted_ingredient = IngredientResponse::from(ingredient);

            converted_ingredient.in_basket = in_basket;
            converted_ingredient.quantities =
                quantities.into_iter().map(QuantityResponse::from).collect();
            shoppinglist.ingredients.push(converted_ingredient);
        }
        shoppinglists.push(shoppinglist);
    }

    format::json(ShoppinglistsResponse { shoppinglists })
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

#[derive(Deserialize, Clone, Debug)]
pub struct NewIngredient {
    ingredient: String,
    quantity: Vec<NewQuantity>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct NewQuantity {
    unit: String,
    value: Option<f32>,
    text: Option<String>,
    _id: Option<u64>,
}

pub async fn add_ingredient(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(params): extract::Json<NewIngredient>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let current = shoppinglists::Entity::find_by_id(id).one(&ctx.db).await?;

    let Some(shoppinglist) = current else {
        return Err(Error::NotFound);
    };

    let ingredient = if let Some(i) = ingredients::Entity::find()
        .filter(Column::Name.eq(&params.ingredient))
        .one(&ctx.db)
        .await?
    {
        i
    } else {
        ingredients::ActiveModel {
            name: ActiveValue::Set(params.ingredient),
            ..Default::default()
        }
        .insert(&ctx.db)
        .await?
    };

    if params.quantity.is_empty() {
        return Err(Error::BadRequest(
            "Need to provide at least one quantity".to_string(),
        ));
    }

    let first = params.quantity.first().unwrap().clone();
    let additional_quantity = quantities::ActiveModel {
        unit: ActiveValue::Set(first.unit),
        value: ActiveValue::Set(first.value),
        text: ActiveValue::Set(first.text),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await?;

    ingredients_in_shoppinglists::ActiveModel {
        in_basket: ActiveValue::Set(false),
        shoppinglists_id: ActiveValue::Set(shoppinglist.id),
        ingredients_id: ActiveValue::Set(ingredient.id),
        quantities_id: ActiveValue::Set(additional_quantity.id),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct RemoveIngredient {
    ingredient: String,
}

pub async fn remove_ingredient(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(params): extract::Json<RemoveIngredient>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let _current = shoppinglists::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let ingredient = ingredients::Entity::find()
        .filter(Column::Name.eq(params.ingredient))
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    ingredients_in_shoppinglists::Entity::delete_many()
        .filter(
            Condition::all()
                .add(ingredients_in_shoppinglists::Column::ShoppinglistsId.eq(id))
                .add(ingredients_in_shoppinglists::Column::IngredientsId.eq(ingredient.id)),
        )
        .exec(&ctx.db)
        .await?;

    Ok(())
}

pub async fn shoppinglist(
    auth: middleware::auth::JWT,
    Path(id): Path<u32>,
    State(ctx): State<AppContext>,
) -> Result<axum::Json<ShoppinglistResponse>> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let Some((list, ingredients)) = Shoppinglists::find_one(&ctx.db, id).await? else {
        return Err(Error::NotFound);
    };

    format::json(ShoppinglistResponse {
        id: list.id,
        name: list.name,
        last_updated: list.updated_at.format("%Y-%m-%dT%H:%M:%S").to_string(),
        ingredients: ingredients
            .into_iter()
            .map(|(ingredient, quants, in_basket)| IngredientResponse {
                id: ingredient.id,
                name: ingredient.name,
                in_basket,
                quantities: quants
                    .into_iter()
                    .map(|q| QuantityResponse {
                        id: q.id,
                        unit: q.unit,
                        value: q.value,
                        text: q.text,
                    })
                    .collect(),
            })
            .collect(),
    })
}

#[derive(Deserialize, Debug)]
pub struct InBasketPayload {
    in_basket: bool,
}

pub async fn toggle_in_basket_for_item(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, ingredient_id)): Path<(u32, u32)>,
    extract::Json(params): extract::Json<InBasketPayload>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let mut ing_on_list = ingredients_in_shoppinglists::Entity::find()
        .filter(
            Condition::all()
                .add(ingredients_in_shoppinglists::Column::ShoppinglistsId.eq(id))
                .add(ingredients_in_shoppinglists::Column::IngredientsId.eq(ingredient_id)),
        )
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?
        .into_active_model();

    ing_on_list.set(
        ingredients_in_shoppinglists::Column::InBasket,
        Value::Bool(Some(params.in_basket)),
    );
    ing_on_list.save(&ctx.db).await?;

    Ok(())
}

pub async fn add_recipe_to_shoppinglist(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, recipe_id)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    // check that it exists
    let _ = shoppinglists::Entity::find_by_id(id).one(&ctx.db).await?;

    let (_recipe, ingredients) = crate::models::recipes::find_one(&ctx.db, recipe_id)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let tx = ctx.db.begin().await?;
    for (ingredient, quantity) in ingredients {
        let q = quantities::ActiveModel {
            unit: ActiveValue::Set(quantity.unit),
            value: ActiveValue::Set(quantity.value),
            text: ActiveValue::Set(quantity.text),
            ..Default::default()
        }
        .insert(&tx)
        .await?;
        ingredients_in_shoppinglists::ActiveModel {
            shoppinglists_id: ActiveValue::Set(id),
            ingredients_id: ActiveValue::Set(ingredient.id),
            quantities_id: ActiveValue::Set(q.id),
            in_basket: ActiveValue::Set(false),
            ..Default::default()
        }
        .insert(&tx)
        .await?;
    }
    tx.commit().await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct AddQuantity {
    quantity: String,
}

pub async fn add_quantity_to_ingredient(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, ingredient_id)): Path<(i32, i32)>,
    extract::Json(params): extract::Json<AddQuantity>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let _ = shoppinglists::Entity::find_by_id(id).one(&ctx.db).await?;

    let quantity = crate::models::quantities::Quantity::parse(&params.quantity)
        .into_active_model()
        .insert(&ctx.db)
        .await?;

    ingredients_in_shoppinglists::ActiveModel {
        shoppinglists_id: ActiveValue::Set(id),
        ingredients_id: ActiveValue::Set(ingredient_id),
        quantities_id: ActiveValue::Set(quantity.id),
        in_basket: ActiveValue::Set(false),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await?;

    Ok(())
}

pub async fn remove_quantity_from_shoppinglist(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, quantity_id)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;
    let _ = shoppinglists::Entity::find_by_id(id).one(&ctx.db).await?;

    let tx = ctx.db.begin().await?;

    ingredients_in_shoppinglists::Entity::delete_many()
        .filter(
            Condition::all()
                .add(ingredients_in_shoppinglists::Column::ShoppinglistsId.eq(id))
                .add(ingredients_in_shoppinglists::Column::QuantitiesId.eq(quantity_id)),
        )
        .exec(&tx)
        .await?;

    quantities::Entity::delete_by_id(quantity_id)
        .exec(&tx)
        .await?;

    tx.commit().await?;

    Ok(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("shoppinglists")
        .add("/", get(all_shoppinglists))
        .add("/:id", get(shoppinglist))
        .add("/", post(create_shoppinglist))
        .add("/:id/ingredient", post(add_ingredient))
        .add("/:id/ingredient", delete(remove_ingredient))
        .add(
            "/:id/ingredient/:ingredient_id/in_basket",
            post(toggle_in_basket_for_item),
        )
        .add("/:id/recipe/:recipe_id", post(add_recipe_to_shoppinglist))
        .add(
            "/:id/ingredient/:ingredient_id/quantity",
            post(add_quantity_to_ingredient),
        )
        .add(
            "/:id/quantity/:quantity_id",
            delete(remove_quantity_from_shoppinglist),
        )
}
