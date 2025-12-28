use foody::app::App;
use foody::models::{_entities, recipes};
use loco_rs::testing;
use sea_orm::{ActiveModelTrait, ActiveValue, EntityTrait, QueryFilter};
use serial_test::serial;

macro_rules! configure_insta {
    ($($expr:expr),*) => {
        let mut settings = insta::Settings::clone_current();
        settings.set_prepend_module_to_snapshot(false);
        settings.set_snapshot_suffix("recipes");
        let _guard = settings.bind_to_scope();
    };
}

async fn create_test_recipe(
    db: &sea_orm::DatabaseConnection,
    name: &str,
) -> _entities::recipes::Model {
    _entities::recipes::ActiveModel {
        name: ActiveValue::Set(name.to_string()),
        source: ActiveValue::Set("book".to_string()),
        book_title: ActiveValue::Set(Some("Test Book".to_string())),
        book_page: ActiveValue::Set(Some(1)),
        tags: ActiveValue::Set(vec!["test".to_string()]),
        rating: ActiveValue::Set(3),
        notes: ActiveValue::Set("Test notes".to_string()),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("Failed to create recipe")
}

async fn create_test_ingredient(
    db: &sea_orm::DatabaseConnection,
    name: &str,
) -> _entities::ingredients::Model {
    use sea_orm::ColumnTrait;
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

async fn create_test_quantity(
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

async fn create_test_aisle(
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

async fn link_ingredient_to_recipe(
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

async fn set_ingredient_aisle(
    db: &sea_orm::DatabaseConnection,
    ingredient_id: i32,
    aisle_id: i32,
) {
    use sea_orm::IntoActiveModel;
    let ingredient = _entities::ingredients::Entity::find_by_id(ingredient_id)
        .one(db)
        .await
        .expect("DB query failed")
        .expect("Ingredient not found");

    let mut active = ingredient.into_active_model();
    active.aisle = ActiveValue::Set(Some(aisle_id));
    active.update(db).await.expect("Failed to update ingredient");
}

#[tokio::test]
#[serial]
async fn find_all_returns_empty_when_no_recipes() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    // Don't seed - start with empty database

    let result = recipes::find_all(&boot.app_context.db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();
    assert!(recipes.is_empty());
}

#[tokio::test]
#[serial]
async fn find_all_returns_recipe_without_ingredients() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();

    let recipe = create_test_recipe(&boot.app_context.db, "Empty Recipe").await;

    let result = recipes::find_all(&boot.app_context.db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();
    assert_eq!(recipes.len(), 1);

    let (found_recipe, ingredients) = &recipes[0];
    assert_eq!(found_recipe.id, recipe.id);
    assert_eq!(found_recipe.name, "Empty Recipe");
    assert!(ingredients.is_empty());
}

#[tokio::test]
#[serial]
async fn find_all_returns_recipe_with_ingredients_and_quantities() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_test_recipe(db, "Recipe With Ingredients").await;
    let chicken = create_test_ingredient(db, "chicken").await;
    let garlic = create_test_ingredient(db, "garlic").await;

    let qty_chicken = create_test_quantity(db, "gram", 500.0).await;
    let qty_garlic = create_test_quantity(db, "count", 2.0).await;

    link_ingredient_to_recipe(db, recipe.id, chicken.id, qty_chicken.id).await;
    link_ingredient_to_recipe(db, recipe.id, garlic.id, qty_garlic.id).await;

    let result = recipes::find_all(db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();
    assert_eq!(recipes.len(), 1);

    let (found_recipe, ingredients) = &recipes[0];
    assert_eq!(found_recipe.name, "Recipe With Ingredients");
    assert_eq!(ingredients.len(), 2);

    // Check that ingredients are correctly associated
    let ingredient_names: Vec<&str> = ingredients.iter().map(|(i, _, _)| i.name.as_str()).collect();
    assert!(ingredient_names.contains(&"chicken"));
    assert!(ingredient_names.contains(&"garlic"));

    // Check quantities
    for (ingredient, quantity, _aisle) in ingredients {
        if ingredient.name == "chicken" {
            assert_eq!(quantity.unit, "gram");
            assert_eq!(quantity.value, Some(500.0));
        } else if ingredient.name == "garlic" {
            assert_eq!(quantity.unit, "count");
            assert_eq!(quantity.value, Some(2.0));
        }
    }
}

#[tokio::test]
#[serial]
async fn find_all_returns_recipe_with_aisle_information() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_test_recipe(db, "Recipe With Aisles").await;
    let produce_aisle = create_test_aisle(db, "Produce", 1).await;
    let meat_aisle = create_test_aisle(db, "Meat", 2).await;

    let tomatoes = create_test_ingredient(db, "tomatoes").await;
    let beef = create_test_ingredient(db, "beef").await;

    set_ingredient_aisle(db, tomatoes.id, produce_aisle.id).await;
    set_ingredient_aisle(db, beef.id, meat_aisle.id).await;

    let qty_tomatoes = create_test_quantity(db, "count", 3.0).await;
    let qty_beef = create_test_quantity(db, "gram", 400.0).await;

    link_ingredient_to_recipe(db, recipe.id, tomatoes.id, qty_tomatoes.id).await;
    link_ingredient_to_recipe(db, recipe.id, beef.id, qty_beef.id).await;

    let result = recipes::find_all(db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();
    assert_eq!(recipes.len(), 1);

    let (_found_recipe, ingredients) = &recipes[0];
    assert_eq!(ingredients.len(), 2);

    for (ingredient, _quantity, aisle) in ingredients {
        assert!(aisle.is_some(), "Aisle should be present for {}", ingredient.name);
        let aisle = aisle.as_ref().unwrap();
        if ingredient.name == "tomatoes" {
            assert_eq!(aisle.name, "Produce");
            assert_eq!(aisle.order, 1);
        } else if ingredient.name == "beef" {
            assert_eq!(aisle.name, "Meat");
            assert_eq!(aisle.order, 2);
        }
    }
}

#[tokio::test]
#[serial]
async fn find_all_handles_ingredient_without_aisle() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_test_recipe(db, "Recipe Mixed Aisles").await;
    let produce_aisle = create_test_aisle(db, "Produce", 1).await;

    let tomatoes = create_test_ingredient(db, "tomatoes_no_aisle").await;
    let mystery_item = create_test_ingredient(db, "mystery_item").await;

    set_ingredient_aisle(db, tomatoes.id, produce_aisle.id).await;
    // mystery_item has no aisle

    let qty_tomatoes = create_test_quantity(db, "count", 3.0).await;
    let qty_mystery = create_test_quantity(db, "unit", 1.0).await;

    link_ingredient_to_recipe(db, recipe.id, tomatoes.id, qty_tomatoes.id).await;
    link_ingredient_to_recipe(db, recipe.id, mystery_item.id, qty_mystery.id).await;

    let result = recipes::find_all(db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();

    let (_found_recipe, ingredients) = &recipes[0];

    for (ingredient, _quantity, aisle) in ingredients {
        if ingredient.name == "tomatoes_no_aisle" {
            assert!(aisle.is_some());
        } else if ingredient.name == "mystery_item" {
            assert!(aisle.is_none(), "mystery_item should have no aisle");
        }
    }
}

#[tokio::test]
#[serial]
async fn find_all_returns_multiple_recipes() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe1 = create_test_recipe(db, "Recipe One").await;
    let _recipe2 = create_test_recipe(db, "Recipe Two").await;
    let _recipe3 = create_test_recipe(db, "Recipe Three").await;

    let salt = create_test_ingredient(db, "salt").await;
    let qty_salt = create_test_quantity(db, "teaspoon", 1.0).await;

    // Only recipe1 has ingredients
    link_ingredient_to_recipe(db, recipe1.id, salt.id, qty_salt.id).await;

    let result = recipes::find_all(db).await;
    assert!(result.is_ok());
    let recipes = result.unwrap();
    assert_eq!(recipes.len(), 3);

    let recipe_names: Vec<&str> = recipes.iter().map(|(r, _)| r.name.as_str()).collect();
    assert!(recipe_names.contains(&"Recipe One"));
    assert!(recipe_names.contains(&"Recipe Two"));
    assert!(recipe_names.contains(&"Recipe Three"));

    // Check that recipe1 has ingredients while others don't
    for (recipe, ingredients) in &recipes {
        if recipe.name == "Recipe One" {
            assert_eq!(ingredients.len(), 1);
        } else {
            assert!(ingredients.is_empty());
        }
    }
}

#[tokio::test]
#[serial]
async fn find_one_returns_none_for_nonexistent_id() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();

    let result = recipes::find_one(&boot.app_context.db, 99999).await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[tokio::test]
#[serial]
async fn find_one_returns_recipe_without_ingredients() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();

    let recipe = create_test_recipe(&boot.app_context.db, "Lonely Recipe").await;

    let result = recipes::find_one(&boot.app_context.db, recipe.id).await;
    assert!(result.is_ok());
    let found = result.unwrap();
    assert!(found.is_some());

    let (found_recipe, ingredients) = found.unwrap();
    assert_eq!(found_recipe.id, recipe.id);
    assert_eq!(found_recipe.name, "Lonely Recipe");
    assert!(ingredients.is_empty());
}

#[tokio::test]
#[serial]
async fn find_one_returns_recipe_with_ingredients() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_test_recipe(db, "Full Recipe").await;
    let onion = create_test_ingredient(db, "onion").await;
    let pepper = create_test_ingredient(db, "pepper").await;

    let qty_onion = create_test_quantity(db, "count", 1.0).await;
    let qty_pepper = create_test_quantity(db, "gram", 50.0).await;

    link_ingredient_to_recipe(db, recipe.id, onion.id, qty_onion.id).await;
    link_ingredient_to_recipe(db, recipe.id, pepper.id, qty_pepper.id).await;

    let result = recipes::find_one(db, recipe.id).await;
    assert!(result.is_ok());
    let found = result.unwrap();
    assert!(found.is_some());

    let (found_recipe, ingredients) = found.unwrap();
    assert_eq!(found_recipe.name, "Full Recipe");
    assert_eq!(ingredients.len(), 2);

    let ingredient_names: Vec<&str> = ingredients.iter().map(|(i, _, _)| i.name.as_str()).collect();
    assert!(ingredient_names.contains(&"onion"));
    assert!(ingredient_names.contains(&"pepper"));
}

#[tokio::test]
#[serial]
async fn find_one_returns_recipe_with_aisle_info() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_test_recipe(db, "Recipe With Aisle").await;
    let dairy_aisle = create_test_aisle(db, "Dairy", 5).await;

    let milk = create_test_ingredient(db, "milk").await;
    set_ingredient_aisle(db, milk.id, dairy_aisle.id).await;

    let qty_milk = create_test_quantity(db, "ml", 500.0).await;
    link_ingredient_to_recipe(db, recipe.id, milk.id, qty_milk.id).await;

    let result = recipes::find_one(db, recipe.id).await;
    assert!(result.is_ok());
    let (_, ingredients) = result.unwrap().unwrap();
    assert_eq!(ingredients.len(), 1);

    let (ingredient, quantity, aisle) = &ingredients[0];
    assert_eq!(ingredient.name, "milk");
    assert_eq!(quantity.unit, "ml");
    assert_eq!(quantity.value, Some(500.0));
    assert!(aisle.is_some());
    let aisle = aisle.as_ref().unwrap();
    assert_eq!(aisle.name, "Dairy");
    assert_eq!(aisle.order, 5);
}

#[tokio::test]
#[serial]
async fn find_one_does_not_return_other_recipes_ingredients() {
    configure_insta!();

    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe1 = create_test_recipe(db, "Recipe A").await;
    let recipe2 = create_test_recipe(db, "Recipe B").await;

    let egg = create_test_ingredient(db, "egg").await;
    let butter = create_test_ingredient(db, "butter").await;

    let qty_egg = create_test_quantity(db, "count", 2.0).await;
    let qty_butter = create_test_quantity(db, "gram", 100.0).await;

    // egg belongs to recipe1, butter belongs to recipe2
    link_ingredient_to_recipe(db, recipe1.id, egg.id, qty_egg.id).await;
    link_ingredient_to_recipe(db, recipe2.id, butter.id, qty_butter.id).await;

    // Query recipe1 - should only have egg
    let result = recipes::find_one(db, recipe1.id).await;
    let (_, ingredients) = result.unwrap().unwrap();
    assert_eq!(ingredients.len(), 1);
    assert_eq!(ingredients[0].0.name, "egg");

    // Query recipe2 - should only have butter
    let result = recipes::find_one(db, recipe2.id).await;
    let (_, ingredients) = result.unwrap().unwrap();
    assert_eq!(ingredients.len(), 1);
    assert_eq!(ingredients[0].0.name, "butter");
}
