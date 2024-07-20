use foody::app::App;
use foody::controllers::recipes::RecipesResponse;
use insta::assert_json_snapshot;
use insta::internals::Redaction;
use loco_rs::testing;
use serde_json::json;
use serial_test::serial;

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

#[tokio::test]
#[serial]
async fn can_list_current_shoppinglists() {
    testing::request::<App, _, _>(|mut request, ctx| async move {
        testing::seed::<App>(&ctx.db).await.unwrap();

        prepare_data::authenticated(&mut request, &ctx).await;

        let res = request.get("/api/shoppinglists").await;

        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".**.id" => "[redacted]",
            ".**.last_updated" => "[redacted]",
            ".shoppinglists" => insta::sorted_redaction(),
        },

        @r###"
        {
          "shoppinglists": [
            {
              "id": "[redacted]",
              "last_updated": "[redacted]",
              "name": "Mondays"
            },
            {
              "id": "[redacted]",
              "last_updated": "[redacted]",
              "name": "Regular salad shop"
            }
          ]
        }
        "###)
    })
    .await;
}

#[tokio::test]
#[serial]
async fn create_a_shoppinglist_and_add_ingredients() {
    testing::request::<App, _, _>(|mut request, ctx| async move {
        testing::seed::<App>(&ctx.db).await.unwrap();

        prepare_data::authenticated(&mut request, &ctx).await;

        // Create a new shoppinglist that we can add things to...
        let res = request
            .post("/api/shoppinglists")
            .json(&json!({"name": "testing-shopping-list"}))
            .await;
        assert_eq!(res.status_code(), 200);

        let created_shoppinglist: serde_json::Value = res.json();
        assert_json_snapshot!(created_shoppinglist,
        {
            ".last_updated" => "[date]",
            ".id" => "[redacted]",
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###
        );

        let id = created_shoppinglist
            .get("id")
            .and_then(|val| val.as_i64())
            .unwrap();

        // ...then, add bananas to the list
        let res = request
            .post(&format!("/api/shoppinglists/{id}/ingredient"))
            .json(&json!({
                    "ingredient": "bananas",
                    "quantity": [{"value": 10, "unit": "count"}]
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        // ...and see that they show up on the list
        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);

        let list = res.json::<serde_json::Value>();
        let bananas = list
            .get("ingredients")
            .and_then(|v| v.as_array())
            .and_then(|ingredients| ingredients.get(0))
            .and_then(|bananas| bananas.get("id"))
            .and_then(|id| id.as_i64())
            .unwrap();
        assert_json_snapshot!(&list,
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redactored]",
        },
        @r###"
        {
          "id": "[redactored]",
          "ingredients": [
            {
              "id": "[redactored]",
              "name": "bananas",
              "note": null,
              "quantities": [
                {
                  "id": "[redactored]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        // then we mark the ingredient as being in the basket
        let res = request
            .post(&format!(
                "/api/shoppinglists/{id}/ingredient/{bananas}/in_basket"
            ))
            .json(&json!({
                "in_basket": true
            }))
            .await;
        assert_eq!(res.status_code(), 200);
        // and we see the update!
        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redactored]",
        },
        @r###"
        {
          "id": "[redactored]",
          "ingredients": [
            {
              "id": "[redactored]",
              "name": "bananas",
              "note": null,
              "quantities": [
                {
                  "id": "[redactored]",
                  "in_basket": true,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request.get("/api/recipes").await;
        assert_eq!(res.status_code(), 200);
        let recipes = res.json::<serde_json::Value>();
        let leek_and_potato_id = recipes
            .get("recipes")
            .and_then(|recipes| recipes.as_array())
            .and_then(|recipes| {
                recipes.iter().find(|r| {
                    r.get("name").and_then(|n| n.as_str()) == Some("leek and parmesan tart")
                })
            })
            .and_then(|r| r.get("id"))
            .and_then(|id| id.as_i64())
            .unwrap();

        let res = request
            .post(&format!(
                "/api/shoppinglists/{id}/recipe/{leek_and_potato_id}"
            ))
            .await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redacted]",
            ".**.recipe_id" => replace_value_with("[recipe_id]"),
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "double cream",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "3x",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 100.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "bananas",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": true,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request
            .delete(&format!("/api/shoppinglists/{id}/ingredient"))
            .json(&json!({
                "ingredient": "bananas",
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        let list = res.json::<serde_json::Value>();
        assert_json_snapshot!(list,
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redactor]",
            ".**.recipe_id" => replace_value_with("[recipe_id]"),
        },
        @r###"
        {
          "id": "[redactor]",
          "ingredients": [
            {
              "id": "[redactor]",
              "name": "double cream",
              "note": null,
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redactor]",
              "name": "leeks",
              "note": null,
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "3x",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redactor]",
              "name": "parmesan shavings",
              "note": null,
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 100.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redactor]",
              "name": "puff pastry",
              "note": null,
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let parmesan_shavings = list
            .get("ingredients")
            .and_then(|ingredients| ingredients.as_array())
            .and_then(|ingredients| {
                ingredients.iter().find(|i| {
                    i.get("name").and_then(|name| name.as_str()) == Some("parmesan shavings")
                })
            })
            .and_then(|parmesan| parmesan.get("id"))
            .and_then(|id| id.as_i64())
            .unwrap();

        let res = request
            .post(&format!(
                "/api/shoppinglists/{id}/ingredient/{parmesan_shavings}/quantity"
            ))
            .json(&json!({
                "quantity": "3.5 kg",
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redacted]",
            ".**.recipe_id" => replace_value_with("[recipe_id]"),
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "double cream",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "3x",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 100.0
                },
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "kilogram",
                  "value": 3.5
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request
            .delete(&format!("/api/shoppinglists/{id}/quantity/21"))
            .await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redacted]",
            ".**.recipe_id" => replace_value_with("[recipe_id]"),
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "double cream",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "3x",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 100.0
                },
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "kilogram",
                  "value": 3.5
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request.get("/api/recipes").await;
        assert_eq!(res.status_code(), 200);
        let recipes = res.json::<RecipesResponse>();
        let easy_chicken_fajitas = recipes
            .recipes
            .into_iter()
            .find_map(|r| {
                if r.name == "easy chicken fajitas" {
                    Some(r.id)
                } else {
                    None
                }
            })
            .unwrap();

        let res = request
            .post(&format!(
                "/api/shoppinglists/{id}/recipe/{easy_chicken_fajitas}"
            ))
            .await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
            ".**.id" => "[redacted]",
            ".**.recipe_id" => replace_value_with("[recipe_id]"),
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "chicken breasts",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "double cream",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "fresh salsa",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 230.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "garlic",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 2.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "ground coriander",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 1.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "ground cumin",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "pinch",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "3x",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "lime",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 1.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "mixed salad",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 bag",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "olive oil",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 4.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "gram",
                  "value": 100.0
                },
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "kilogram",
                  "value": 3.5
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "red chilli",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 1.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "red onion",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 1.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "red pepper",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 1.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "smoked paprika",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "text": "pinch",
                  "unit": "arbitrary"
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "tabasco",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "tablespoon",
                  "value": 4.0
                }
              ],
              "tags": []
            },
            {
              "id": "[redacted]",
              "name": "tortilla",
              "note": null,
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": "[recipe_id]",
                  "unit": "count",
                  "value": 8.0
                }
              ],
              "tags": []
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);
    })
    .await;
}
