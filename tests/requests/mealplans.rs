use foody::app::App;
use insta::assert_json_snapshot;
use insta::internals::Redaction;
use loco_rs::testing;
use serde_json::json;
use serial_test::serial;
use uuid::Uuid;

use crate::requests::prepare_data;

fn replace_value_with(replacement: &'static str) -> Redaction {
    insta::dynamic_redaction(|value, _path| {
        if !value.is_nil() {
            replacement.into()
        } else {
            value
        }
    })
}

// ============================================================================
// Helper functions for common test operations
// ============================================================================

/// Create a new meal plan and return its ID
async fn create_mealplan(request: &loco_rs::TestServer, name: &str) -> i64 {
    let res = request
        .post("/api/mealplans")
        .json(&json!({
            "name": name,
            "keep_uncooked": false
        }))
        .await;
    assert_eq!(res.status_code(), 200);
    let plan: serde_json::Value = res.json();
    plan.get("id").and_then(|v| v.as_i64()).unwrap()
}

/// Find a meal plan by name and return it as JSON
async fn find_mealplan_by_name<'a>(
    request: &loco_rs::TestServer,
    name: &str,
) -> serde_json::Value {
    let res = request.get("/api/mealplans").await;
    let plans: serde_json::Value = res.json();
    plans
        .get("meal_plans")
        .and_then(|p| p.as_array())
        .and_then(|p| {
            p.iter()
                .find(|plan| plan.get("name").and_then(|n| n.as_str()) == Some(name))
        })
        .cloned()
        .expect("Should find meal plan by name")
}

/// Get the first recipe ID from the database
async fn get_first_recipe_id(request: &loco_rs::TestServer) -> i64 {
    let res = request.get("/api/recipes").await;
    assert_eq!(res.status_code(), 200);
    let recipes: serde_json::Value = res.json();
    recipes
        .get("recipes")
        .and_then(|r| r.as_array())
        .and_then(|r| r.first())
        .and_then(|r| r.get("id"))
        .and_then(|id| id.as_i64())
        .expect("Should have at least one recipe")
}

/// Get recipe IDs and names for the first N recipes
async fn get_recipes(request: &loco_rs::TestServer, count: usize) -> Vec<(i64, String)> {
    let res = request.get("/api/recipes").await;
    assert_eq!(res.status_code(), 200);
    let recipes: serde_json::Value = res.json();
    let recipes_array = recipes.get("recipes").and_then(|r| r.as_array()).unwrap();

    if recipes_array.len() < count {
        panic!("Need at least {count} recipes in seed data for this test");
    }

    recipes_array
        .iter()
        .take(count)
        .map(|r| {
            let id = r.get("id").and_then(|id| id.as_i64()).unwrap();
            let name = r.get("name").and_then(|n| n.as_str()).unwrap().to_string();
            (id, name)
        })
        .collect()
}

/// Add a recipe-based meal to a meal plan
async fn add_recipe_meal(
    request: &loco_rs::TestServer,
    plan_id: i64,
    recipe_id: i64,
    section: Option<&str>,
) {
    let mut payload = json!({
        "details": {"type": "from_recipe", "id": recipe_id}
    });
    if let Some(s) = section {
        payload["section"] = json!(s);
    }
    let res = request
        .post(&format!("/api/mealplans/{plan_id}/meal"))
        .json(&payload)
        .await;
    assert_eq!(res.status_code(), 200);
}

/// Add an untracked meal to a meal plan
async fn add_untracked_meal(
    request: &loco_rs::TestServer,
    plan_id: i64,
    meal_name: &str,
    section: Option<&str>,
) {
    let mut payload = json!({
        "details": {"type": "untracked", "name": meal_name}
    });
    if let Some(s) = section {
        payload["section"] = json!(s);
    }
    let res = request
        .post(&format!("/api/mealplans/{plan_id}/meal"))
        .json(&payload)
        .await;
    assert_eq!(res.status_code(), 200);
}

/// Get meals from a meal plan JSON object
fn get_meals(plan: &serde_json::Value) -> &Vec<serde_json::Value> {
    plan.get("meals")
        .and_then(|m| m.as_array())
        .expect("Meal plan should have meals array")
}

/// Find a meal by its section
fn find_meal_by_section<'a>(
    meals: &'a [serde_json::Value],
    section: &str,
) -> &'a serde_json::Value {
    meals
        .iter()
        .find(|meal| meal.get("section").and_then(|s| s.as_str()) == Some(section))
        .expect("Should find meal with given section")
}

/// Find a meal by its recipe ID
fn find_meal_by_recipe_id<'a>(
    meals: &'a [serde_json::Value],
    recipe_id: i64,
) -> &'a serde_json::Value {
    meals
        .iter()
        .find(|meal| {
            meal.get("details")
                .and_then(|d| d.get("id"))
                .and_then(|id| id.as_i64())
                == Some(recipe_id)
        })
        .expect("Should find meal with given recipe_id")
}

/// Get the ID from a meal JSON object
fn get_meal_id(meal: &serde_json::Value) -> i64 {
    meal.get("id")
        .and_then(|id| id.as_i64())
        .expect("Meal should have id")
}

/// Mark a meal as cooked
async fn mark_meal_cooked(request: &loco_rs::TestServer, plan_id: i64, meal_id: i64) {
    let res = request
        .post(&format!("/api/mealplans/{plan_id}/meal/{meal_id}/cooked"))
        .json(&json!({"is_cooked": true}))
        .await;
    assert_eq!(res.status_code(), 200);
}

#[tokio::test]
#[serial]
async fn can_create_empty_meal_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_create_empty_meal_plan";
        clean_mealplans(&request, name).await;

        let res = request
            .post("/api/mealplans")
            .json(&json!({
                "name": name,
                "keep_uncooked": false
            }))
            .await;

        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".id" => "[id]",
            ".created_at" => "[timestamp]",
        },
        @r#"
        {
          "created_at": "[timestamp]",
          "id": "[id]",
          "meals": [],
          "name": "can_create_empty_meal_plan"
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_add_recipe_based_meal_to_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_add_recipe_based_meal_to_plan";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        let recipe_id = get_first_recipe_id(&request).await;
        add_recipe_meal(&request, plan_id, recipe_id, Some("Monday")).await;

        let our_plan = find_mealplan_by_name(&request, name).await;

        assert_json_snapshot!(our_plan,
        {
            ".id" => "[id]",
            ".created_at" => "[timestamp]",
            ".meals[].id" => "[meal_id]",
            ".meals[].created_at" => "[timestamp]",
            ".meals[].details.id" => "[recipe_id]",
        },
        @r#"
        {
          "created_at": "[timestamp]",
          "id": "[id]",
          "meals": [
            {
              "created_at": "[timestamp]",
              "details": {
                "id": "[recipe_id]",
                "type": "from_recipe"
              },
              "id": "[meal_id]",
              "is_cooked": false,
              "section": "Monday"
            }
          ],
          "name": "can_add_recipe_based_meal_to_plan"
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_add_untracked_meal_to_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_add_untracked_meal_to_plan";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        add_untracked_meal(&request, plan_id, "Leftover Pizza", Some("Tuesday")).await;

        let our_plan = find_mealplan_by_name(&request, name).await;

        assert_json_snapshot!(our_plan,
        {
            ".id" => "[id]",
            ".created_at" => "[timestamp]",
            ".meals[].id" => "[meal_id]",
            ".meals[].created_at" => "[timestamp]",
        },
        @r#"
        {
          "created_at": "[timestamp]",
          "id": "[id]",
          "meals": [
            {
              "created_at": "[timestamp]",
              "details": {
                "name": "Leftover Pizza",
                "type": "untracked"
              },
              "id": "[meal_id]",
              "is_cooked": false,
              "section": "Tuesday"
            }
          ],
          "name": "can_add_untracked_meal_to_plan"
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_mark_meal_as_cooked() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_mark_meal_as_cooked";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        let recipe_id = get_first_recipe_id(&request).await;
        add_recipe_meal(&request, plan_id, recipe_id, None).await;

        // Get the meal ID and mark it as cooked
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        let meal_id = get_meal_id(&meals[0]);

        mark_meal_cooked(&request, plan_id, meal_id).await;

        // Verify it's marked as cooked
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        assert_eq!(
            meals[0].get("is_cooked").and_then(|v| v.as_bool()),
            Some(true)
        );
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_create_meal_plan_inheriting_uncooked_meals() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name1 = "can_create_meal_plan_inheriting_uncooked_meals_1";
        let name2 = "can_create_meal_plan_inheriting_uncooked_meals_2";
        clean_mealplans(&request, name1).await;
        clean_mealplans(&request, name2).await;

        let plan_id = create_mealplan(&request, name1).await;
        let recipes = get_recipes(&request, 2).await;
        let (recipe1_id, _) = recipes[0].clone();
        let (recipe2_id, _) = recipes[1].clone();

        // Add 3 meals: Monday (cooked), Tuesday (uncooked), Wednesday (untracked)
        add_recipe_meal(&request, plan_id, recipe1_id, Some("Monday")).await;
        add_recipe_meal(&request, plan_id, recipe2_id, Some("Tuesday")).await;
        add_untracked_meal(&request, plan_id, "Takeout Thai", Some("Wednesday")).await;

        // Mark Monday meal as cooked
        let our_plan = find_mealplan_by_name(&request, name1).await;
        let meals = get_meals(&our_plan);
        let monday_meal = find_meal_by_section(meals, "Monday");
        let monday_meal_id = get_meal_id(monday_meal);
        mark_meal_cooked(&request, plan_id, monday_meal_id).await;

        // Create a new meal plan that inherits uncooked meals
        let res = request
            .post("/api/mealplans")
            .json(&json!({
                "name": name2,
                "keep_uncooked": true
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        let week2: serde_json::Value = res.json();

        // Week 2 should have 2 meals (the uncooked ones from Week 1)
        let meals = week2.get("meals").and_then(|m| m.as_array()).unwrap();
        assert_eq!(
            meals.len(),
            2,
            "Week 2 should have 2 uncooked meals from Week 1"
        );

        assert_json_snapshot!(week2,
        {
            ".id" => "[id]",
            ".created_at" => "[timestamp]",
            ".meals[].id" => "[meal_id]",
            ".meals[].created_at" => "[timestamp]",
            ".meals[].details.id" => replace_value_with("[recipe_id]"),
            ".meals" => insta::sorted_redaction(),
        },
        @r#"
        {
          "created_at": "[timestamp]",
          "id": "[id]",
          "meals": [
            {
              "created_at": "[timestamp]",
              "details": {
                "id": "[recipe_id]",
                "type": "from_recipe"
              },
              "id": "[meal_id]",
              "is_cooked": false,
              "section": "Tuesday"
            },
            {
              "created_at": "[timestamp]",
              "details": {
                "name": "Takeout Thai",
                "type": "untracked"
              },
              "id": "[meal_id]",
              "is_cooked": false,
              "section": "Wednesday"
            }
          ],
          "name": "can_create_meal_plan_inheriting_uncooked_meals_2"
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_set_meal_section() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_set_meal_section";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        add_untracked_meal(&request, plan_id, "Pizza", None).await;

        // Get the meal ID
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        let meal_id = get_meal_id(&meals[0]);

        // Set the section
        let res = request
            .post(&format!("/api/mealplans/{plan_id}/meal/{meal_id}/section"))
            .json(&json!({"section": "Friday Dinner"}))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify section is set
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        assert_eq!(
            meals[0].get("section").and_then(|s| s.as_str()),
            Some("Friday Dinner")
        );
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete_meal_from_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = Uuid::new_v4().to_string();

        let plan_id = create_mealplan(&request, &name).await;
        add_untracked_meal(&request, plan_id, "Pizza", None).await;
        add_untracked_meal(&request, plan_id, "Burgers", None).await;

        let our_plan = find_mealplan_by_name(&request, &name).await;
        let meals = get_meals(&our_plan);
        assert_eq!(meals.len(), 2);

        let first_meal_id = get_meal_id(&meals[0]);

        // Delete the first meal
        let res = request
            .delete(&format!("/api/mealplans/{plan_id}/meal/{first_meal_id}"))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify only one meal remains
        let our_plan = find_mealplan_by_name(&request, &name).await;
        let meals = get_meals(&our_plan);
        assert_eq!(meals.len(), 1);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_clear_all_meals_from_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_clear_all_meals_from_plan";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        add_untracked_meal(&request, plan_id, "Pizza", None).await;
        add_untracked_meal(&request, plan_id, "Burgers", None).await;

        // Clear the meal plan
        let res = request
            .post(&format!("/api/mealplans/{plan_id}/clear"))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify meals are cleared
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        assert_eq!(meals.len(), 0);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete_meal_plan() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "can_delete_meal_plan";
        clean_mealplans(&request, name).await;

        let plan_id = create_mealplan(&request, name).await;
        add_untracked_meal(&request, plan_id, "Pizza", None).await;

        // Delete the meal plan
        let res = request.delete(&format!("/api/mealplans/{plan_id}")).await;
        assert_eq!(res.status_code(), 200);

        // Verify it's gone
        let res = request.get("/api/mealplans").await;
        let plans: serde_json::Value = res.json();
        let meal_plans = plans.get("meal_plans").and_then(|p| p.as_array()).unwrap();
        let found = meal_plans
            .iter()
            .any(|plan| plan.get("name").and_then(|n| n.as_str()) == Some(name));
        assert!(!found, "Deleted meal plan should not exist");
    })
    .await;
}

/// Clean up ALL existing meal plans with this name from previous runs
async fn clean_mealplans(request: &loco_rs::TestServer, name: &str) {
    let res = request.get("/api/mealplans").await;
    let plans: serde_json::Value = res.json();
    if let Some(meal_plans) = plans.get("meal_plans").and_then(|p| p.as_array()) {
        for existing in meal_plans
            .iter()
            .filter(|plan| plan.get("name").and_then(|n| n.as_str()) == Some(name))
        {
            if let Some(id) = existing.get("id").and_then(|id| id.as_i64()) {
                request.delete(&format!("/api/mealplans/{id}")).await;
            }
        }
    }
}

async fn cleanup_shoppinglist(request: &loco_rs::TestServer, name: &str) {
    // Clean up ALL existing shopping lists with this name from previous runs
    let res = request.get("/api/shoppinglists").await;
    let lists: serde_json::Value = res.json();
    if let Some(shoppinglists) = lists.get("shoppinglists").and_then(|p| p.as_array()) {
        for existing in shoppinglists
            .iter()
            .filter(|list| list.get("name").and_then(|n| n.as_str()) == Some(name))
        {
            if let Some(id) = existing.get("id").and_then(|id| id.as_i64()) {
                request.delete(&format!("/api/shoppinglists/{id}")).await;
            }
        }
    }
}

#[tokio::test]
#[serial]
async fn adding_mealplan_to_shoppinglist_only_adds_uncooked_recipes() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let name = "adding_mealplan_to_shoppinglist_only_adds_uncooked_recipes";

        clean_mealplans(&request, name).await;
        cleanup_shoppinglist(&request, name).await;

        // Create a shopping list
        let res = request
            .post("/api/shoppinglists")
            .json(&json!({"name": name}))
            .await;
        assert_eq!(res.status_code(), 200);
        let list: serde_json::Value = res.json();
        let list_id = list.get("id").and_then(|v| v.as_i64()).unwrap();

        let plan_id = create_mealplan(&request, name).await;
        let recipes = get_recipes(&request, 2).await;
        let (recipe1_id, recipe1_name) = recipes[0].clone();
        let (recipe2_id, recipe2_name) = recipes[1].clone();

        // Add both recipes as meals plus an untracked meal
        add_recipe_meal(&request, plan_id, recipe1_id, None).await;
        add_recipe_meal(&request, plan_id, recipe2_id, None).await;
        add_untracked_meal(&request, plan_id, "Takeout", None).await;

        // Mark the meal for recipe1 as cooked
        let our_plan = find_mealplan_by_name(&request, name).await;
        let meals = get_meals(&our_plan);
        let recipe1_meal = find_meal_by_recipe_id(meals, recipe1_id);
        let recipe1_meal_id = get_meal_id(recipe1_meal);
        mark_meal_cooked(&request, plan_id, recipe1_meal_id).await;

        // Add the meal plan to the shopping list
        let res = request
            .post(&format!("/api/mealplans/{plan_id}/shoppinglist"))
            .json(&json!({"shoppinglist": list_id}))
            .await;
        assert_eq!(res.status_code(), 200);

        // Get the shopping list and verify
        let res = request.get(&format!("/api/shoppinglists/{list_id}")).await;
        assert_eq!(res.status_code(), 200);
        let list: serde_json::Value = res.json();

        let ingredients = list.get("ingredients").and_then(|i| i.as_array()).unwrap();

        // All ingredients should have recipe_id matching recipe2, not recipe1
        for ingredient in ingredients {
            let quantities = ingredient.get("quantities").and_then(|q| q.as_array()).unwrap();
            for qty in quantities {
                let recipe_id = qty.get("recipe_id").and_then(|r| r.as_i64());
                assert!(
                    recipe_id.is_none() || recipe_id == Some(recipe2_id as i64),
                    "Shopping list should only contain ingredients from uncooked recipe ({recipe2_name}), not cooked recipe ({recipe1_name})"
                );
            }
        }

        // Verify we have some ingredients (from recipe2)
        assert!(
            !ingredients.is_empty(),
            "Shopping list should have ingredients from the uncooked recipe"
        );
    })
    .await;
}
