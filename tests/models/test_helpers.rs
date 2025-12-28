use foody::models::_entities;
use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter,
};

pub async fn create_ingredient(
    db: &sea_orm::DatabaseConnection,
    name: &str,
) -> _entities::ingredients::Model {
    match _entities::ingredients::Entity::find()
        .filter(_entities::ingredients::Column::Name.eq(name))
        .one(db)
        .await
        .expect("DB query failed")
    {
        Some(existing) => existing,
        None => _entities::ingredients::ActiveModel {
            name: ActiveValue::Set(name.to_string()),
            tags: ActiveValue::Set(vec![]),
            ..Default::default()
        }
        .insert(db)
        .await
        .expect("Failed to create ingredient"),
    }
}

pub async fn create_quantity(
    db: &sea_orm::DatabaseConnection,
    unit: &str,
    value: f32,
) -> _entities::quantities::Model {
    _entities::quantities::ActiveModel {
        unit: ActiveValue::Set(unit.to_string()),
        value: ActiveValue::Set(Some(value)),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to create quantity")
}

pub async fn create_aisle(
    db: &sea_orm::DatabaseConnection,
    name: &str,
    order: i16,
) -> _entities::aisles::Model {
    _entities::aisles::ActiveModel {
        name: ActiveValue::Set(name.to_string()),
        order: ActiveValue::Set(order),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to create aisle")
}

pub async fn create_recipe(
    db: &sea_orm::DatabaseConnection,
    name: &str,
) -> _entities::recipes::Model {
    _entities::recipes::ActiveModel {
        name: ActiveValue::Set(name.to_string()),
        source: ActiveValue::Set("book".to_string()),
        book_title: ActiveValue::Set(Some("Test Book".to_string())),
        book_page: ActiveValue::Set(Some(1)),
        tags: ActiveValue::Set(vec![]),
        rating: ActiveValue::Set(3),
        notes: ActiveValue::Set("".to_string()),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to create recipe")
}

pub async fn create_shoppinglist(
    db: &sea_orm::DatabaseConnection,
    name: &str,
) -> _entities::shoppinglists::Model {
    _entities::shoppinglists::ActiveModel {
        name: ActiveValue::Set(name.to_string()),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to create shopping list")
}

pub async fn set_ingredient_aisle(
    db: &sea_orm::DatabaseConnection,
    ingredient_id: i32,
    aisle_id: i32,
) {
    let ingredient = _entities::ingredients::Entity::find_by_id(ingredient_id)
        .one(db)
        .await
        .expect("DB query failed")
        .expect("Ingredient not found");

    let mut active = ingredient.into_active_model();
    active.aisle = ActiveValue::Set(Some(aisle_id));
    active
        .update(db)
        .await
        .expect("Failed to update ingredient");
}

pub async fn link_ingredient_to_recipe(
    db: &sea_orm::DatabaseConnection,
    recipe_id: i32,
    ingredient_id: i32,
    quantity_id: i32,
) {
    _entities::ingredients_in_recipes::ActiveModel {
        recipes_id: ActiveValue::Set(recipe_id),
        ingredients_id: ActiveValue::Set(ingredient_id),
        quantities_id: ActiveValue::Set(quantity_id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to link ingredient to recipe");
}

pub async fn add_ingredient_to_shoppinglist(
    db: &sea_orm::DatabaseConnection,
    shoppinglist_id: i32,
    ingredient_id: i32,
    quantity_id: i32,
    in_basket: bool,
    recipe_id: Option<i32>,
    note: Option<String>,
) {
    _entities::ingredients_in_shoppinglists::ActiveModel {
        shoppinglists_id: ActiveValue::Set(shoppinglist_id),
        ingredients_id: ActiveValue::Set(ingredient_id),
        quantities_id: ActiveValue::Set(quantity_id),
        in_basket: ActiveValue::Set(in_basket),
        recipe_id: ActiveValue::Set(recipe_id),
        note: ActiveValue::Set(note),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to add ingredient to shopping list");
}
