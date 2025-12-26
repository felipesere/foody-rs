use crate::requests::prepare_data;
use foody::{
    app::App,
    controllers::recipes::{RecipeResponse, RecipesResponse},
    models::{_entities, ingredients},
};
use insta::assert_json_snapshot;
use loco_rs::testing;
use sea_orm::{prelude::*, ActiveValue, EntityTrait, IntoActiveModel, QueryFilter};
use serde_json::json;
use serial_test::serial;

async fn named_ingredient(db: &DatabaseConnection, name: &str) -> _entities::ingredients::Model {
    let x = _entities::ingredients::Entity::find()
        .filter(_entities::ingredients::Column::Name.eq(name))
        .one(db)
        .await
        .expect("DB operation failed");

    match x {
        Some(x) => x,
        None => ingredients::ActiveModel {
            name: ActiveValue::Set(name.to_string()),
            ..Default::default()
        }
        .insert(db)
        .await
        .expect("DB oepration failed"),
    }
}

#[tokio::test]
#[serial]
async fn can_create_and_update_a_recipe() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();

        prepare_data::authenticated(&mut request, &ctx).await;

        let bacon = named_ingredient(&ctx.db, "bacon").await;
        let apples = named_ingredient(&ctx.db, "apples").await;
        let plums = named_ingredient(&ctx.db, "plums").await;

        let something_recipe = serde_json::json!({
            "name": "something something",
            "tags": ["a", "b"],
            "notes": "a b c...",
            "rating": 1,
            "source": "book",
            "page": 12,
            "title": "simplissie",
            "ingredients": [
            {
              "ingredient": {
                "id": bacon.id
              },
              "quantity": [{
                "unit": "grams",
                "value": 100,
              }]
            },
            {
              "ingredient": {
                "id": apples.id
              },
              "quantity": [{
                "unit": "grams",
                "value": 140,
              }]
            },
            {
              "ingredient": {
                "id": plums.id,
              },
              "quantity": [{
                    "unit": "count",
                    "value": 0.5,
              }]
            }
            ]
        });

        let res = request.post("/api/recipes").json(&something_recipe).await;
        assert_eq!(res.status_code(), 200);

        let res = request.get("/api/recipes").await;
        assert_eq!(res.status_code(), 200);
        let all_recipes = res.json::<RecipesResponse>();

        let something_something = all_recipes
            .recipes
            .into_iter()
            .find(|r| r.name == "something something")
            .unwrap();

        let id = something_something.id;
        assert_eq!(something_something.ingredients.len(), 3);
        assert_eq!(something_something.tags.len(), 2);

        let res = request
            .post(&format!("/api/recipes/{id}/edit"))
            .json(&serde_json::json!({
                "changes": [
                {
                    "type": "name",
                    "value": "something something"
                },
                {
                    "type": "source",
                    "value": {
                        "type": "book",
                        "title": "simplissime",
                        "page": 12
                    }
                },
                {
                    "type": "tags",
                    "value": ["alpha", "bravo", "charlie"]
                },
                {
                    "type": "ingredients",
                    "value": { "type": "set", "ingredients": [
                        {"id": bacon.id, "quantity": "100g"},
                        {"id": apples.id, "quantity": "140g"},
                        {"id": plums.id, "quantity": "0.5x"},
                        ]
                    }
                }
                ],
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        let something_something = res.json::<RecipeResponse>();
        assert_eq!(something_something.ingredients.len(), 3);
        assert_eq!(something_something.tags.len(), 3);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_list_all_recipes() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let res = request.get("/api/recipes").await;
        assert_eq!(res.status_code(), 200);

        let recipes: RecipesResponse = res.json();
        assert!(!recipes.recipes.is_empty(), "Should have seeded recipes");

        // Verify structure
        let first = &recipes.recipes[0];
        assert!(!first.name.is_empty());
        assert!(first.id > 0);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_single_recipe_with_ingredients() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        // TODO: Consider if there is a valuable helper in here...
        let recipe = _entities::recipes::ActiveModel {
            name: ActiveValue::set("can_get_single_recipe_with_ingredients".to_string()),
            source: ActiveValue::set("website".into()),
            website_url: ActiveValue::set(Some("www.example.com".to_string())),
            book_title: ActiveValue::set(None),
            book_page: ActiveValue::set(None),
            ..Default::default()
        }
        .save(&ctx.db)
        .await
        .unwrap();

        let ingredients = vec![
            ("chicken breasts", 2.0, "count"),
            ("fresh salsa", 230.0, "gram"),
            ("garlic", 2.0, "count"),
        ];
        for i in ingredients {
            let ingredient = match _entities::ingredients::Entity::find()
                .filter(_entities::ingredients::Column::Name.eq(i.0.to_string()))
                .one(&ctx.db)
                .await
                .unwrap()
            {
                Some(ingredient) => ingredient.into_active_model(),
                None => _entities::ingredients::ActiveModel {
                    name: ActiveValue::Set(i.0.to_string()),
                    ..Default::default()
                }
                .save(&ctx.db)
                .await
                .unwrap(),
            };

            let quantity = _entities::quantities::ActiveModel {
                unit: ActiveValue::Set(i.2.to_string()),
                value: ActiveValue::Set(Some(i.1)),
                ..Default::default()
            }
            .save(&ctx.db)
            .await
            .unwrap();

            _entities::ingredients_in_recipes::ActiveModel {
                recipes_id: recipe.id.clone(),
                ingredients_id: ingredient.id,
                quantities_id: quantity.id,
                ..Default::default()
            }
            .save(&ctx.db)
            .await
            .unwrap();
        }

        let recipe_id = recipe.id.unwrap();

        // Get the single recipe
        let res = request.get(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);

        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".id" => "[id]",
            ".ingredients[].ingredient.id" => "[ingredient_id]",
            ".ingredients[].quantity[].id" => "[quantity_id]",
        },
        @r#"
        {
          "duration": null,
          "id": "[id]",
          "ingredients": [
            {
              "ingredient": {
                "aisle": null,
                "id": "[ingredient_id]",
                "name": "chicken breasts",
                "stored_in": null,
                "tags": []
              },
              "quantity": [
                {
                  "id": "[quantity_id]",
                  "unit": "count",
                  "value": 2.0
                }
              ]
            },
            {
              "ingredient": {
                "aisle": null,
                "id": "[ingredient_id]",
                "name": "fresh salsa",
                "stored_in": null,
                "tags": []
              },
              "quantity": [
                {
                  "id": "[quantity_id]",
                  "unit": "gram",
                  "value": 230.0
                }
              ]
            },
            {
              "ingredient": {
                "aisle": null,
                "id": "[ingredient_id]",
                "name": "garlic",
                "stored_in": null,
                "tags": []
              },
              "quantity": [
                {
                  "id": "[quantity_id]",
                  "unit": "count",
                  "value": 2.0
                }
              ]
            }
          ],
          "name": "can_get_single_recipe_with_ingredients",
          "notes": "",
          "page": null,
          "rating": 0,
          "source": "website",
          "tags": [],
          "title": null,
          "url": "www.example.com"
        }
        "#);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_add_ingredient_to_recipe() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let tomatoes = named_ingredient(&ctx.db, "tomatoes").await;

        // Create a simple recipe without ingredients
        let res = request
            .post("/api/recipes")
            .json(&json!({
                "name": "simple test recipe",
                "tags": [],
                "notes": "",
                "rating": 3,
                "source": "book",
                "page": 1,
                "title": "Test Book",
                "ingredients": []
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let recipe: RecipeResponse = res.json();
        let recipe_id = recipe.id;
        assert_eq!(recipe.ingredients.len(), 0);

        // Add an ingredient
        let res = request
            .post(&format!("/api/recipes/{recipe_id}/ingredients"))
            .json(&json!({
                "ingredient": tomatoes.id,
                "quantity": "500g"
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify the ingredient was added
        let res = request.get(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);
        let updated_recipe: serde_json::Value = res.json();
        let ingredients = updated_recipe
            .get("ingredients")
            .and_then(|i| i.as_array())
            .unwrap();
        assert_eq!(ingredients.len(), 1);
        let ingredient_name = ingredients[0]
            .get("ingredient")
            .and_then(|i| i.get("name"))
            .and_then(|n| n.as_str())
            .unwrap();
        assert_eq!(ingredient_name, "tomatoes");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_remove_ingredient_from_recipe() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let bacon = named_ingredient(&ctx.db, "bacon").await;
        let apples = named_ingredient(&ctx.db, "apples").await;

        // Create a recipe with two ingredients
        let res = request
            .post("/api/recipes")
            .json(&json!({
                "name": "recipe to remove from",
                "tags": [],
                "notes": "",
                "rating": 3,
                "source": "book",
                "page": 1,
                "title": "Test Book",
                "ingredients": [
                    {
                        "ingredient": {"id": bacon.id},
                        "quantity": [{"unit": "gram", "value": 100}]
                    },
                    {
                        "ingredient": {"id": apples.id},
                        "quantity": [{"unit": "count", "value": 2}]
                    }
                ]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let recipe: RecipeResponse = res.json();
        let recipe_id = recipe.id;
        assert_eq!(recipe.ingredients.len(), 2);

        // Remove bacon
        let res = request
            .delete(&format!(
                "/api/recipes/{recipe_id}/ingredients/{}",
                bacon.id
            ))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify only apples remain
        let res = request.get(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);
        let updated_recipe: serde_json::Value = res.json();
        let ingredients = updated_recipe
            .get("ingredients")
            .and_then(|i| i.as_array())
            .unwrap();
        assert_eq!(ingredients.len(), 1);
        let ingredient_name = ingredients[0]
            .get("ingredient")
            .and_then(|i| i.get("name"))
            .and_then(|n| n.as_str())
            .unwrap();
        assert_eq!(ingredient_name, "apples");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_all_recipe_tags() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let res = request.get("/api/recipes/tags").await;
        assert_eq!(res.status_code(), 200);

        let tags: serde_json::Value = res.json();
        let tags_array = tags.get("tags").and_then(|t| t.as_array()).unwrap();

        // The seed data should have some tags
        assert!(
            !tags_array.is_empty(),
            "Should have recipe tags from seed data"
        );
    })
    .await;
}

#[tokio::test]
#[serial]
async fn deleting_recipe_cleans_up_shopping_list_references() {
    testing::request::request::<App, _, _>(|mut request, ctx| async move {
        testing::db::seed::<App>(&ctx).await.unwrap();
        prepare_data::authenticated(&mut request, &ctx).await;

        let bacon = named_ingredient(&ctx.db, "bacon").await;
        let apples = named_ingredient(&ctx.db, "apples").await;

        // Create a recipe
        let res = request
            .post("/api/recipes")
            .json(&json!({
                "name": "recipe to delete",
                "tags": ["test"],
                "notes": "",
                "rating": 3,
                "source": "book",
                "page": 1,
                "title": "Test Book",
                "ingredients": [
                    {
                        "ingredient": {"id": bacon.id},
                        "quantity": [{"unit": "gram", "value": 100}]
                    },
                    {
                        "ingredient": {"id": apples.id},
                        "quantity": [{"unit": "count", "value": 2}]
                    }
                ]
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        let recipe: RecipeResponse = res.json();
        let recipe_id = recipe.id;

        // Create a shopping list
        let res = request
            .post("/api/shoppinglists")
            .json(&json!({"name": "test-delete-list"}))
            .await;
        assert_eq!(res.status_code(), 200);
        let list: serde_json::Value = res.json();
        let list_id = list.get("id").and_then(|v| v.as_i64()).unwrap();

        // Add the recipe to the shopping list
        let res = request
            .post(&format!("/api/shoppinglists/{list_id}/recipe/{recipe_id}"))
            .await;
        assert_eq!(res.status_code(), 200);

        // Verify the shopping list has items with recipe_id set
        let res = request.get(&format!("/api/shoppinglists/{list_id}")).await;
        let list: serde_json::Value = res.json();
        let ingredients = list.get("ingredients").and_then(|i| i.as_array()).unwrap();
        assert!(
            !ingredients.is_empty(),
            "Shopping list should have items from recipe"
        );

        // Verify at least one item has the recipe_id
        let has_recipe_ref = ingredients.iter().any(|ing| {
            ing.get("quantities")
                .and_then(|q| q.as_array())
                .map(|quantities| {
                    quantities.iter().any(|qty| {
                        qty.get("recipe_id")
                            .and_then(|r| r.as_i64())
                            .is_some_and(|id| id == recipe_id as i64)
                    })
                })
                .unwrap_or(false)
        });
        assert!(
            has_recipe_ref,
            "Shopping list items should reference the recipe"
        );

        // Delete the recipe
        let res = request.delete(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);

        // Verify the recipe is gone
        let res = request.get(&format!("/api/recipes/{recipe_id}")).await;
        assert_eq!(res.status_code(), 404,);

        // Verify the shopping list items still exist but recipe_id is now null
        let res = request.get(&format!("/api/shoppinglists/{list_id}")).await;
        assert_eq!(res.status_code(), 200);
        let updated_list: serde_json::Value = res.json();
        let updated_ingredients = updated_list
            .get("ingredients")
            .and_then(|i| i.as_array())
            .unwrap();

        // Items should still exist
        assert!(
            !updated_ingredients.is_empty(),
            "Shopping list items should still exist after recipe deletion"
        );

        // But recipe_id should be null for all quantities
        let all_recipe_ids_null = updated_ingredients.iter().all(|ing| {
            ing.get("quantities")
                .and_then(|q| q.as_array())
                .map(|quantities| {
                    quantities
                        .iter()
                        .all(|qty| qty.get("recipe_id").map(|r| r.is_null()).unwrap_or(true))
                })
                .unwrap_or(true)
        });
        assert!(
            all_recipe_ids_null,
            "All recipe_id references should be null after recipe deletion"
        );

        assert_json_snapshot!(updated_list,
        {
            ".id" => "[id]",
            ".last_updated" => "[timestamp]",
            ".ingredients[].ingredient.id" => "[ingredient_id]",
            ".ingredients[].quantities[].quantity.id" => "[quantity_id]",
            ".ingredients" => insta::sorted_redaction(),
        },
        @r#"
        {
          "id": "[id]",
          "ingredients": [
            {
              "ingredient": {
                "aisle": null,
                "id": "[ingredient_id]",
                "name": "apples",
                "stored_in": null,
                "tags": []
              },
              "note": null,
              "quantities": [
                {
                  "in_basket": false,
                  "quantity": {
                    "id": "[quantity_id]",
                    "unit": "count",
                    "value": 2.0
                  },
                  "recipe_id": null
                }
              ]
            },
            {
              "ingredient": {
                "aisle": null,
                "id": "[ingredient_id]",
                "name": "bacon",
                "stored_in": null,
                "tags": []
              },
              "note": null,
              "quantities": [
                {
                  "in_basket": false,
                  "quantity": {
                    "id": "[quantity_id]",
                    "unit": "gram",
                    "value": 100.0
                  },
                  "recipe_id": null
                }
              ]
            }
          ],
          "last_updated": "[timestamp]",
          "name": "test-delete-list"
        }
        "#);
    })
    .await;
}
