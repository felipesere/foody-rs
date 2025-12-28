use crate::models::test_helpers::{
    add_ingredient_to_shoppinglist, create_aisle, create_ingredient, create_quantity,
    create_recipe, create_shoppinglist, set_ingredient_aisle,
};
use foody::app::App;
use foody::models::shoppinglists::Shoppinglist;
use loco_rs::testing;
use serial_test::serial;

// ============== find_one tests ==============

#[tokio::test]
#[serial]
async fn find_one_returns_empty_list() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list = create_shoppinglist(db, "Empty List").await;

    let result = Shoppinglist::find_one(db, list.id as u32).await.unwrap();
    assert!(result.is_some());

    let full_list = result.unwrap();
    assert_eq!(full_list.list.id, list.id);
    assert_eq!(full_list.list.name, "Empty List");
    assert!(full_list.items.is_empty());
}

#[tokio::test]
#[serial]
async fn find_one_returns_list_with_basic_items() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list = create_shoppinglist(db, "Weekly Groceries").await;
    let milk = create_ingredient(db, "milk").await;
    let bread = create_ingredient(db, "bread").await;

    let qty_milk = create_quantity(db, "liters", 2.0).await;
    let qty_bread = create_quantity(db, "count", 1.0).await;

    add_ingredient_to_shoppinglist(db, list.id, milk.id, qty_milk.id, false, None, None).await;
    add_ingredient_to_shoppinglist(db, list.id, bread.id, qty_bread.id, false, None, None).await;

    let full_list = Shoppinglist::find_one(db, list.id as u32)
        .await
        .unwrap()
        .unwrap();

    assert_eq!(full_list.list.name, "Weekly Groceries");
    assert_eq!(full_list.items.len(), 2);

    let item_names: Vec<&str> = full_list
        .items
        .iter()
        .map(|i| i.ingredient.name.as_str())
        .collect();
    assert!(item_names.contains(&"milk"));
    assert!(item_names.contains(&"bread"));
}

/// Tests that find_one correctly returns all item fields:
/// - in_basket status
/// - recipe_id reference
/// - note
/// - aisle information (including NULL aisle case)
#[tokio::test]
#[serial]
async fn find_one_returns_complete_item_data() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list = create_shoppinglist(db, "Complete Test").await;
    let recipe = create_recipe(db, "Dinner").await;
    let produce_aisle = create_aisle(db, "Produce", 1).await;

    // Item with all fields populated
    let tomato = create_ingredient(db, "tomato").await;
    set_ingredient_aisle(db, tomato.id, produce_aisle.id).await;
    let qty_tomato = create_quantity(db, "count", 4.0).await;
    add_ingredient_to_shoppinglist(
        db,
        list.id,
        tomato.id,
        qty_tomato.id,
        true, // in basket
        Some(recipe.id),
        Some("Get the ripe ones".to_string()),
    )
    .await;

    // Item with minimal fields (no aisle, no recipe, no note, not in basket)
    let mystery = create_ingredient(db, "mystery_item").await;
    let qty_mystery = create_quantity(db, "unit", 1.0).await;
    add_ingredient_to_shoppinglist(db, list.id, mystery.id, qty_mystery.id, false, None, None)
        .await;

    let full_list = Shoppinglist::find_one(db, list.id as u32)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(full_list.items.len(), 2);

    for item in &full_list.items {
        match item.ingredient.name.as_str() {
            "tomato" => {
                // Check aisle
                let aisle = item.aisle.as_ref().expect("tomato should have aisle");
                assert_eq!(aisle.name, "Produce");
                assert_eq!(aisle.order, 1);
                // Check note
                assert_eq!(item.note.as_deref(), Some("Get the ripe ones"));
                // Check quantity fields
                assert_eq!(item.quantities.len(), 1);
                let qty = &item.quantities[0];
                assert!(qty.in_basket, "tomato should be in basket");
                assert_eq!(qty.recipe_id, Some(recipe.id));
                assert_eq!(qty.quantity.unit, "count");
                assert_eq!(qty.quantity.value, Some(4.0));
            }
            "mystery_item" => {
                assert!(item.aisle.is_none());
                assert!(item.note.is_none());
                assert_eq!(item.quantities.len(), 1);
                let qty = &item.quantities[0];
                assert!(!qty.in_basket);
                assert!(qty.recipe_id.is_none());
            }
            name => panic!("Unexpected ingredient: {}", name),
        }
    }
}

#[tokio::test]
#[serial]
async fn find_one_aggregates_multiple_quantities_for_same_ingredient() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list = create_shoppinglist(db, "Multi Quantity List").await;
    let flour = create_ingredient(db, "flour").await;

    let qty_flour_1 = create_quantity(db, "gram", 500.0).await;
    let qty_flour_2 = create_quantity(db, "gram", 250.0).await;

    add_ingredient_to_shoppinglist(db, list.id, flour.id, qty_flour_1.id, false, None, None).await;
    add_ingredient_to_shoppinglist(db, list.id, flour.id, qty_flour_2.id, false, None, None).await;

    let full_list = Shoppinglist::find_one(db, list.id as u32)
        .await
        .unwrap()
        .unwrap();

    assert_eq!(full_list.items.len(), 1);
    let flour_item = &full_list.items[0];
    assert_eq!(flour_item.ingredient.name, "flour");
    assert!(flour_item.quantities.len() >= 1);
}

// ============== find_all tests ==============

#[tokio::test]
#[serial]
async fn find_all_returns_empty_when_no_lists() {
    let boot = testing::request::boot_test::<App>().await.unwrap();

    let result = Shoppinglist::find_all(&boot.app_context.db).await.unwrap();
    assert!(result.is_empty());
}

#[tokio::test]
#[serial]
async fn find_all_returns_multiple_lists() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let _list1 = create_shoppinglist(db, "List One").await;
    let _list2 = create_shoppinglist(db, "List Two").await;
    let _list3 = create_shoppinglist(db, "List Three").await;

    let result = Shoppinglist::find_all(db).await.unwrap();
    assert_eq!(result.len(), 3);

    let list_names: Vec<&str> = result.iter().map(|l| l.list.name.as_str()).collect();
    assert!(list_names.contains(&"List One"));
    assert!(list_names.contains(&"List Two"));
    assert!(list_names.contains(&"List Three"));
}

#[tokio::test]
#[serial]
async fn find_all_returns_empty_lists_alongside_filled_ones() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list1 = create_shoppinglist(db, "Has Items").await;
    let _list2 = create_shoppinglist(db, "Empty List").await;

    let sugar = create_ingredient(db, "sugar").await;
    let qty_sugar = create_quantity(db, "kg", 1.0).await;
    add_ingredient_to_shoppinglist(db, list1.id, sugar.id, qty_sugar.id, false, None, None).await;

    let result = Shoppinglist::find_all(db).await.unwrap();
    assert_eq!(result.len(), 2);

    for list in &result {
        if list.list.name == "Has Items" {
            assert_eq!(list.items.len(), 1);
        } else if list.list.name == "Empty List" {
            assert!(list.items.is_empty());
        }
    }
}

/// Tests that find_all correctly returns all item fields:
/// - in_basket status
/// - recipe_id reference
/// - aisle information
#[tokio::test]
#[serial]
async fn find_all_returns_complete_item_data() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list = create_shoppinglist(db, "Complete List").await;
    let recipe = create_recipe(db, "Lunch").await;
    let frozen_aisle = create_aisle(db, "Frozen", 7).await;

    // Item in basket with recipe reference and aisle
    let ice_cream = create_ingredient(db, "ice_cream").await;
    set_ingredient_aisle(db, ice_cream.id, frozen_aisle.id).await;
    let qty_ice_cream = create_quantity(db, "tub", 1.0).await;
    add_ingredient_to_shoppinglist(
        db,
        list.id,
        ice_cream.id,
        qty_ice_cream.id,
        true,
        Some(recipe.id),
        None,
    )
    .await;

    // Item not in basket, no recipe, no aisle
    let salt = create_ingredient(db, "salt").await;
    let qty_salt = create_quantity(db, "pinch", 1.0).await;
    add_ingredient_to_shoppinglist(db, list.id, salt.id, qty_salt.id, false, None, None).await;

    let result = Shoppinglist::find_all(db).await.unwrap();
    assert_eq!(result.len(), 1);

    let full_list = &result[0];
    assert_eq!(full_list.items.len(), 2);

    for item in &full_list.items {
        match item.ingredient.name.as_str() {
            "ice_cream" => {
                let aisle = item.aisle.as_ref().expect("ice_cream should have aisle");
                assert_eq!(aisle.name, "Frozen");
                assert_eq!(aisle.order, 7);
                assert!(item.quantities[0].in_basket);
                assert_eq!(item.quantities[0].recipe_id, Some(recipe.id));
            }
            "salt" => {
                assert!(item.aisle.is_none());
                assert!(!item.quantities[0].in_basket);
                assert!(item.quantities[0].recipe_id.is_none());
            }
            name => panic!("Unexpected ingredient: {}", name),
        }
    }
}

#[tokio::test]
#[serial]
async fn find_all_isolates_items_between_lists() {
    let boot = testing::request::boot_test::<App>().await.unwrap();
    let db = &boot.app_context.db;

    let list_a = create_shoppinglist(db, "List A").await;
    let list_b = create_shoppinglist(db, "List B").await;

    let coffee = create_ingredient(db, "coffee").await;
    let tea = create_ingredient(db, "tea").await;

    let qty_coffee = create_quantity(db, "gram", 250.0).await;
    let qty_tea = create_quantity(db, "box", 1.0).await;

    add_ingredient_to_shoppinglist(db, list_a.id, coffee.id, qty_coffee.id, false, None, None)
        .await;
    add_ingredient_to_shoppinglist(db, list_b.id, tea.id, qty_tea.id, false, None, None).await;

    let result = Shoppinglist::find_all(db).await.unwrap();

    for list in &result {
        assert_eq!(list.items.len(), 1);
        if list.list.name == "List A" {
            assert_eq!(list.items[0].ingredient.name, "coffee");
        } else if list.list.name == "List B" {
            assert_eq!(list.items[0].ingredient.name, "tea");
        }
    }
}
