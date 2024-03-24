use axum::http::{header, HeaderValue};
use foody::app::App;
use insta::assert_json_snapshot;
use loco_rs::app::AppContext;
use loco_rs::testing;
use serde_json::json;
use serial_test::serial;

use crate::requests::prepare_data;

async fn auth_token(ctx: &AppContext) -> String {
    let user = foody::models::users::users::Model::find_by_email(&ctx.db, "jim@example.com")
        .await
        .unwrap();

    let jwt_secret = ctx.config.get_jwt_config().unwrap();

    let token = user
        .generate_jwt(&jwt_secret.secret, &jwt_secret.expiration)
        .unwrap();

    token
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
              "ingredients": [],
              "last_updated": "[redacted]",
              "name": "Regular salad shop"
            },
            {
              "id": "[redacted]",
              "ingredients": [
                {
                  "id": "[redacted]",
                  "name": "chicken stock",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "millilitre",
                      "value": 600.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "chicken thighs",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "count",
                      "value": 6.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "chorizo",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "grams",
                      "value": 150.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "garlic",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "count",
                      "value": 2.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "lemon",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "count",
                      "value": 1.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "paella rice",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "grams",
                      "value": 250.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "parsley",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "gram",
                      "value": 20.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "red onion",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "count",
                      "value": 1.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "red pepper",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "unit": "count",
                      "value": 2.0
                    }
                  ]
                },
                {
                  "id": "[redacted]",
                  "name": "saffron",
                  "quantities": [
                    {
                      "id": "[redacted]",
                      "in_basket": false,
                      "recipe_id": null,
                      "text": "1 pinch",
                      "unit": "arbitrary"
                    }
                  ]
                }
              ],
              "last_updated": "[redacted]",
              "name": "Mondays"
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
              "quantities": [
                {
                  "id": "[redactored]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ]
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
              "quantities": [
                {
                  "id": "[redactored]",
                  "in_basket": true,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ]
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request.get(&format!("/api/recipes")).await;
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
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "bananas",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": true,
                  "recipe_id": null,
                  "unit": "count",
                  "value": 10.0
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "double cream",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "3 small",
                  "unit": "arbitrary"
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "gram",
                  "value": 100.0
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ]
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
        },
        @r###"
        {
          "id": "[redactor]",
          "ingredients": [
            {
              "id": "[redactor]",
              "name": "double cream",
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ]
            },
            {
              "id": "[redactor]",
              "name": "leeks",
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "3 small",
                  "unit": "arbitrary"
                }
              ]
            },
            {
              "id": "[redactor]",
              "name": "parmesan shavings",
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "gram",
                  "value": 100.0
                }
              ]
            },
            {
              "id": "[redactor]",
              "name": "puff pastry",
              "quantities": [
                {
                  "id": "[redactor]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ]
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
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "double cream",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "3 small",
                  "unit": "arbitrary"
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
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
              ]
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ]
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
        },
        @r###"
        {
          "id": "[redacted]",
          "ingredients": [
            {
              "id": "[redacted]",
              "name": "double cream",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "unit": "tablespoon",
                  "value": 2.0
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "leeks",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "3 small",
                  "unit": "arbitrary"
                }
              ]
            },
            {
              "id": "[redacted]",
              "name": "parmesan shavings",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
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
              ]
            },
            {
              "id": "[redacted]",
              "name": "puff pastry",
              "quantities": [
                {
                  "id": "[redacted]",
                  "in_basket": false,
                  "recipe_id": null,
                  "text": "1 sheet",
                  "unit": "arbitrary"
                }
              ]
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###)
    })
    .await;
}
