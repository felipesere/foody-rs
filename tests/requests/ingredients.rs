use foody::app::App;
use insta::assert_json_snapshot;
use loco_rs::testing;
use serde_json::json;
use serial_test::serial;

use crate::requests::prepare_data;

#[tokio::test]
#[serial]
async fn can_list_all_ingredients() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let res = request.get("/api/ingredients").await;
        assert_eq!(res.status_code(), 200);

        let ingredients: serde_json::Value = res.json();
        let ingredients_array = ingredients.as_array().unwrap();

        // Verify we have ingredients from seed data
        assert!(
            !ingredients_array.is_empty(),
            "Should have seeded ingredients"
        );

        // Verify structure of first ingredient
        let first = &ingredients_array[0];
        assert!(first.get("id").is_some());
        assert!(first.get("name").is_some());
        assert!(first.get("tags").is_some());
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_create_ingredient() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "dragon fruit",
                "tags": ["exotic", "fruit"]
            }))
            .await;

        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".id" => "[id]",
        },
        @r#"
        {
          "aisle": null,
          "id": "[id]",
          "name": "dragon fruit",
          "stored_in": null,
          "tags": [
            "exotic",
            "fruit"
          ]
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn creating_duplicate_ingredient_returns_existing() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // Create an ingredient
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "unique-test-ingredient",
                "tags": ["test"]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let first: serde_json::Value = res.json();
        let first_id = first.get("id").and_then(|v| v.as_i64()).unwrap();

        // Try to create it again
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "unique-test-ingredient",
                "tags": ["different-tags"]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let second: serde_json::Value = res.json();
        let second_id = second.get("id").and_then(|v| v.as_i64()).unwrap();

        // Should return the same ingredient
        assert_eq!(
            first_id, second_id,
            "Should return existing ingredient, not create a duplicate"
        );
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_edit_ingredient_name() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // Create an ingredient
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "old-name",
                "tags": []
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let created: serde_json::Value = res.json();
        let id = created.get("id").and_then(|v| v.as_i64()).unwrap();

        // Edit the name
        let res = request
            .post(&format!("/api/ingredients/{id}"))
            .json(&json!({
                "changes": [
                    {"type": "name", "value": "new-name"}
                ]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".id" => "[id]",
        },
        @r#"
        {
          "aisle": null,
          "id": "[id]",
          "name": "new-name",
          "stored_in": null,
          "tags": []
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_edit_ingredient_tags() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // Create an ingredient
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "tagged-ingredient",
                "tags": ["old-tag"]
            }))
            .await;
        let created: serde_json::Value = res.json();
        let id = created.get("id").and_then(|v| v.as_i64()).unwrap();

        // Edit the tags
        let res = request
            .post(&format!("/api/ingredients/{id}"))
            .json(&json!({
                "changes": [
                    {"type": "tags", "value": ["new-tag-1", "new-tag-2"]}
                ]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".id" => "[id]",
        },
        @r#"
        {
          "aisle": null,
          "id": "[id]",
          "name": "tagged-ingredient",
          "stored_in": null,
          "tags": [
            "new-tag-1",
            "new-tag-2"
          ]
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_all_ingredient_tags() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // Create ingredients with specific tags
        request
            .post("/api/ingredients")
            .json(&json!({
                "name": "test-ingredient-a",
                "tags": ["vegetable", "green"]
            }))
            .await;

        request
            .post("/api/ingredients")
            .json(&json!({
                "name": "test-ingredient-b",
                "tags": ["fruit", "sweet"]
            }))
            .await;

        let res = request.get("/api/ingredients/tags").await;
        assert_eq!(res.status_code(), 200);

        let tags: serde_json::Value = res.json();
        let tags_array = tags.get("tags").and_then(|t| t.as_array()).unwrap();

        // Verify our tags are in the list
        let tag_strings: Vec<&str> = tags_array.iter().filter_map(|t| t.as_str()).collect();

        assert!(
            tag_strings.contains(&"vegetable"),
            "Should contain 'vegetable' tag"
        );
        assert!(tag_strings.contains(&"fruit"), "Should contain 'fruit' tag");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_merge_ingredients_updates_all_references() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // Create target ingredient (the one to merge INTO)
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "parmesan",
                "tags": ["cheese"]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let target: serde_json::Value = res.json();
        let target_id = target.get("id").and_then(|v| v.as_i64()).unwrap() as u32;

        // Create ingredients to be replaced
        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "parmigiano",
                "tags": ["cheese"]
            }))
            .await;
        let to_replace1: serde_json::Value = res.json();
        let replace1_id = to_replace1.get("id").and_then(|v| v.as_i64()).unwrap() as u32;

        let res = request
            .post("/api/ingredients")
            .json(&json!({
                "name": "parmesan cheese",
                "tags": ["cheese"]
            }))
            .await;
        let to_replace2: serde_json::Value = res.json();
        let replace2_id = to_replace2.get("id").and_then(|v| v.as_i64()).unwrap() as u32;

        // Create a recipe using one of the ingredients to be merged
        let res = request
            .post("/api/recipes")
            .json(&json!({
                "name": "test merge recipe",
                "tags": ["test"],
                "notes": "",
                "rating": 3,
                "source": "book",
                "page": 1,
                "title": "Test Book",
                "ingredients": [
                    {
                        "ingredient": {"id": replace1_id},
                        "quantity": [{"unit": "gram", "value": 50}]
                    }
                ]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let recipe: serde_json::Value = res.json();
        let recipe_id = recipe.get("id").and_then(|v| v.as_i64()).unwrap();

        // Create a shopping list and add the other ingredient to be merged
        let res = request
            .post("/api/shoppinglists")
            .json(&json!({"name": "test-merge-list"}))
            .await;
        let list: serde_json::Value = res.json();
        let list_id = list.get("id").and_then(|v| v.as_i64()).unwrap();

        request
            .post(&format!("/api/shoppinglists/{list_id}/ingredient"))
            .json(&json!({
                "ingredient": "parmesan cheese",
                "quantity": [{"value": 100, "unit": "gram"}]
            }))
            .await;

        // Now merge the ingredients
        let res = request
            .post("/api/ingredients/merge")
            .json(&json!({
                "replace": [replace1_id, replace2_id],
                "target": target_id
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify the recipe now references the target ingredient
        let res = request.get(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);
        let updated_recipe: serde_json::Value = res.json();
        let ingredients = updated_recipe
            .get("ingredients")
            .and_then(|i| i.as_array())
            .unwrap();

        assert!(
            !ingredients.is_empty(),
            "Recipe should still have ingredients"
        );
        let ingredient_id = ingredients[0]
            .get("ingredient")
            .and_then(|i| i.get("id"))
            .and_then(|id| id.as_i64())
            .unwrap();
        assert_eq!(
            ingredient_id, target_id as i64,
            "Recipe ingredient should be updated to target"
        );

        // Verify the shopping list now references the target ingredient
        let res = request.get(&format!("/api/shoppinglists/{list_id}")).await;
        assert_eq!(res.status_code(), 200);
        let updated_list: serde_json::Value = res.json();
        let list_ingredients = updated_list
            .get("ingredients")
            .and_then(|i| i.as_array())
            .unwrap();

        assert!(
            !list_ingredients.is_empty(),
            "Shopping list should still have ingredients"
        );
        let list_ingredient_id = list_ingredients[0]
            .get("ingredient")
            .and_then(|i| i.get("id"))
            .and_then(|id| id.as_i64())
            .unwrap();
        assert_eq!(
            list_ingredient_id, target_id as i64,
            "Shopping list ingredient should be updated to target"
        );

        // Verify the replaced ingredients no longer exist
        let res = request.get("/api/ingredients").await;
        let all_ingredients: Vec<serde_json::Value> = res.json();
        let ingredient_ids: Vec<i64> = all_ingredients
            .iter()
            .filter_map(|i| i.get("id").and_then(|id| id.as_i64()))
            .collect();

        assert!(
            !ingredient_ids.contains(&(replace1_id as i64)),
            "Replaced ingredient 1 should be deleted"
        );
        assert!(
            !ingredient_ids.contains(&(replace2_id as i64)),
            "Replaced ingredient 2 should be deleted"
        );
        assert!(
            ingredient_ids.contains(&(target_id as i64)),
            "Target ingredient should still exist"
        );
    })
    .await;
}
