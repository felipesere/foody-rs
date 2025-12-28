use crate::models::test_helpers::{
    create_aisle, create_ingredient, create_quantity, create_recipe, link_ingredient_to_recipe,
    set_ingredient_aisle,
};
use foody::app::App;
use foody::models::recipes;
use loco_rs::testing;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn find_all_returns_empty_when_no_recipes() {
    let boot = testing::request::boot_test::<App>().await.unwrap();

    let result = recipes::find_all(&boot.app_context.db).await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_empty());
}

#[tokio::test]
#[serial]
async fn find_all_returns_recipe_without_ingredients() {
    let boot = testing::request::boot_test::<App>().await.unwrap();

    let recipe = create_recipe(&boot.app_context.db, "Empty Recipe").await;

    let result = recipes::find_all(&boot.app_context.db).await.unwrap();
    assert_eq!(result.len(), 1);

    let (found_recipe, ingredients) = &result[0];
    assert_eq!(found_recipe.id, recipe.id);
    assert_eq!(found_recipe.name, "Empty Recipe");
    assert!(ingredients.is_empty());
}

/// Tests that find_all correctly returns ingredients with their quantities and aisle information,
/// including the case where some ingredients have no aisle assigned (LEFT JOIN behavior).
#[tokio::test]
#[serial]
async fn find_all_returns_recipe_with_ingredients_quantities_and_aisles() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_recipe(db, "Full Recipe").await;
    let produce_aisle = create_aisle(db, "Produce", 1).await;
    let meat_aisle = create_aisle(db, "Meat", 2).await;

    // Ingredient with aisle
    let tomatoes = create_ingredient(db, "tomatoes").await;
    set_ingredient_aisle(db, tomatoes.id, produce_aisle.id).await;
    let qty_tomatoes = create_quantity(db, "count", 3.0).await;
    link_ingredient_to_recipe(db, recipe.id, tomatoes.id, qty_tomatoes.id).await;

    // Ingredient with different aisle
    let beef = create_ingredient(db, "beef").await;
    set_ingredient_aisle(db, beef.id, meat_aisle.id).await;
    let qty_beef = create_quantity(db, "gram", 400.0).await;
    link_ingredient_to_recipe(db, recipe.id, beef.id, qty_beef.id).await;

    // Ingredient without aisle (tests LEFT JOIN)
    let mystery = create_ingredient(db, "mystery_spice").await;
    let qty_mystery = create_quantity(db, "pinch", 1.0).await;
    link_ingredient_to_recipe(db, recipe.id, mystery.id, qty_mystery.id).await;

    let result = recipes::find_all(db).await.unwrap();
    assert_eq!(result.len(), 1);

    let (found_recipe, ingredients) = &result[0];
    assert_eq!(found_recipe.name, "Full Recipe");
    assert_eq!(ingredients.len(), 3);

    for (ingredient, quantity, aisle) in ingredients {
        match ingredient.name.as_str() {
            "tomatoes" => {
                assert_eq!(quantity.unit, "count");
                assert_eq!(quantity.value, Some(3.0));
                let aisle = aisle.as_ref().expect("tomatoes should have aisle");
                assert_eq!(aisle.name, "Produce");
                assert_eq!(aisle.order, 1);
            }
            "beef" => {
                assert_eq!(quantity.unit, "gram");
                assert_eq!(quantity.value, Some(400.0));
                let aisle = aisle.as_ref().expect("beef should have aisle");
                assert_eq!(aisle.name, "Meat");
                assert_eq!(aisle.order, 2);
            }
            "mystery_spice" => {
                assert_eq!(quantity.unit, "pinch");
                assert_eq!(quantity.value, Some(1.0));
                assert!(aisle.is_none(), "mystery_spice should have no aisle");
            }
            name => panic!("Unexpected ingredient: {}", name),
        }
    }
}

#[tokio::test]
#[serial]
async fn find_all_returns_multiple_recipes_with_correct_ingredients() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe1 = create_recipe(db, "Recipe One").await;
    let _recipe2 = create_recipe(db, "Recipe Two").await;
    let _recipe3 = create_recipe(db, "Recipe Three").await;

    let salt = create_ingredient(db, "salt").await;
    let qty_salt = create_quantity(db, "teaspoon", 1.0).await;
    link_ingredient_to_recipe(db, recipe1.id, salt.id, qty_salt.id).await;

    let result = recipes::find_all(db).await.unwrap();
    assert_eq!(result.len(), 3);

    let recipe_names: Vec<&str> = result.iter().map(|(r, _)| r.name.as_str()).collect();
    assert!(recipe_names.contains(&"Recipe One"));
    assert!(recipe_names.contains(&"Recipe Two"));
    assert!(recipe_names.contains(&"Recipe Three"));

    for (recipe, ingredients) in &result {
        if recipe.name == "Recipe One" {
            assert_eq!(ingredients.len(), 1);
            assert_eq!(ingredients[0].0.name, "salt");
        } else {
            assert!(ingredients.is_empty());
        }
    }
}

#[tokio::test]
#[serial]
async fn find_one_returns_none_for_nonexistent_id() {
    let boot = testing::request::boot_test::<App>().await.unwrap();

    let result = recipes::find_one(&boot.app_context.db, 99999).await;
    assert!(result.is_ok());
    assert!(result.unwrap().is_none());
}

#[tokio::test]
#[serial]
async fn find_one_returns_recipe_without_ingredients() {
    let boot = testing::request::boot_test::<App>().await.unwrap();

    let recipe = create_recipe(&boot.app_context.db, "Lonely Recipe").await;

    let result = recipes::find_one(&boot.app_context.db, recipe.id)
        .await
        .unwrap();
    assert!(result.is_some());

    let (found_recipe, ingredients) = result.unwrap();
    assert_eq!(found_recipe.id, recipe.id);
    assert_eq!(found_recipe.name, "Lonely Recipe");
    assert!(ingredients.is_empty());
}

/// Tests that find_one correctly returns a recipe with ingredients, quantities, and aisle info.
#[tokio::test]
#[serial]
async fn find_one_returns_recipe_with_ingredients_and_aisle() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe = create_recipe(db, "Complete Recipe").await;
    let dairy_aisle = create_aisle(db, "Dairy", 5).await;

    let milk = create_ingredient(db, "milk").await;
    set_ingredient_aisle(db, milk.id, dairy_aisle.id).await;
    let qty_milk = create_quantity(db, "ml", 500.0).await;
    link_ingredient_to_recipe(db, recipe.id, milk.id, qty_milk.id).await;

    let onion = create_ingredient(db, "onion").await;
    let qty_onion = create_quantity(db, "count", 1.0).await;
    link_ingredient_to_recipe(db, recipe.id, onion.id, qty_onion.id).await;

    let result = recipes::find_one(db, recipe.id).await.unwrap().unwrap();
    let (found_recipe, ingredients) = result;

    assert_eq!(found_recipe.name, "Complete Recipe");
    assert_eq!(ingredients.len(), 2);

    for (ingredient, quantity, aisle) in &ingredients {
        match ingredient.name.as_str() {
            "milk" => {
                assert_eq!(quantity.unit, "ml");
                assert_eq!(quantity.value, Some(500.0));
                let aisle = aisle.as_ref().expect("milk should have aisle");
                assert_eq!(aisle.name, "Dairy");
                assert_eq!(aisle.order, 5);
            }
            "onion" => {
                assert_eq!(quantity.unit, "count");
                assert_eq!(quantity.value, Some(1.0));
                assert!(aisle.is_none(), "onion should have no aisle");
            }
            name => panic!("Unexpected ingredient: {}", name),
        }
    }
}

#[tokio::test]
#[serial]
async fn find_one_does_not_return_other_recipes_ingredients() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let recipe1 = create_recipe(db, "Recipe A").await;
    let recipe2 = create_recipe(db, "Recipe B").await;

    let egg = create_ingredient(db, "egg").await;
    let butter = create_ingredient(db, "butter").await;

    let qty_egg = create_quantity(db, "count", 2.0).await;
    let qty_butter = create_quantity(db, "gram", 100.0).await;

    link_ingredient_to_recipe(db, recipe1.id, egg.id, qty_egg.id).await;
    link_ingredient_to_recipe(db, recipe2.id, butter.id, qty_butter.id).await;

    // Query recipe1 - should only have egg
    let (_, ingredients) = recipes::find_one(db, recipe1.id).await.unwrap().unwrap();
    assert_eq!(ingredients.len(), 1);
    assert_eq!(ingredients[0].0.name, "egg");

    // Query recipe2 - should only have butter
    let (_, ingredients) = recipes::find_one(db, recipe2.id).await.unwrap().unwrap();
    assert_eq!(ingredients.len(), 1);
    assert_eq!(ingredients[0].0.name, "butter");
}
