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
        assert_json_snapshot!(res.json::<serde_json::Value>(), @r###"
        {
          "shoppinglists": [
            {
              "id": 1,
              "ingredients": [
                {
                  "id": 1,
                  "in_basket": false,
                  "name": "red onion",
                  "quantities": [
                    {
                      "id": 1,
                      "unit": "count",
                      "value": 1
                    }
                  ]
                },
                {
                  "id": 5,
                  "in_basket": false,
                  "name": "chorizo",
                  "quantities": [
                    {
                      "id": 5,
                      "unit": "grams",
                      "value": 150
                    }
                  ]
                },
                {
                  "id": 6,
                  "in_basket": false,
                  "name": "saffron",
                  "quantities": [
                    {
                      "id": 6,
                      "text": "1 pinch",
                      "unit": "arbitrary"
                    }
                  ]
                },
                {
                  "id": 8,
                  "in_basket": false,
                  "name": "paella rice",
                  "quantities": [
                    {
                      "id": 7,
                      "unit": "grams",
                      "value": 250
                    }
                  ]
                },
                {
                  "id": 9,
                  "in_basket": false,
                  "name": "chicken stock",
                  "quantities": [
                    {
                      "id": 8,
                      "unit": "millilitre",
                      "value": 600
                    }
                  ]
                },
                {
                  "id": 10,
                  "in_basket": false,
                  "name": "lemon",
                  "quantities": [
                    {
                      "id": 9,
                      "unit": "count",
                      "value": 1
                    }
                  ]
                },
                {
                  "id": 13,
                  "in_basket": false,
                  "name": "red pepper",
                  "quantities": [
                    {
                      "id": 2,
                      "unit": "count",
                      "value": 2
                    }
                  ]
                },
                {
                  "id": 17,
                  "in_basket": false,
                  "name": "garlic",
                  "quantities": [
                    {
                      "id": 3,
                      "unit": "count",
                      "value": 2
                    }
                  ]
                },
                {
                  "id": 24,
                  "in_basket": false,
                  "name": "parsley",
                  "quantities": [
                    {
                      "id": 10,
                      "unit": "gram",
                      "value": 20
                    },
                    {
                      "id": 11,
                      "unit": "gram",
                      "value": 333
                    }
                  ]
                },
                {
                  "id": 49,
                  "in_basket": false,
                  "name": "chicken thighs",
                  "quantities": [
                    {
                      "id": 4,
                      "unit": "count",
                      "value": 6
                    }
                  ]
                }
              ],
              "last_updated": "2023-11-12T12:34:56",
              "name": "Mondays"
            },
            {
              "id": 2,
              "ingredients": [],
              "last_updated": "2023-11-12T12:34:56",
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

        let token = auth_token(&ctx).await;
        request.add_header(
            header::AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {token}")).unwrap(),
        );

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
        },
        @r###"
        {
          "id": 3,
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
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
        },
        @r###"
        {
          "id": 3,
          "ingredients": [
            {
              "id": 52,
              "in_basket": false,
              "name": "bananas",
              "quantities": [
                {
                  "id": 16,
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
        let ingredient_id = 52;
        let res = request
            .post(&format!(
                "/api/shoppinglists/{id}/ingredient/{ingredient_id}/in_basket"
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
        },
        @r###"
        {
          "id": 3,
          "ingredients": [
            {
              "id": 52,
              "in_basket": true,
              "name": "bananas",
              "quantities": [
                {
                  "id": 16,
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

        let recipe_id = 1;
        let res = request.post(&format!("/api/shoppinglists/{id}/recipe/{recipe_id}")).await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
        },
        @r###"
        {
          "id": 3,
          "ingredients": [
            {
              "id": 1,
              "in_basket": false,
              "name": "red onion",
              "quantities": [
                {
                  "id": 17,
                  "unit": "gram",
                  "value": 100.0
                }
              ]
            },
            {
              "id": 13,
              "in_basket": false,
              "name": "red pepper",
              "quantities": [
                {
                  "id": 18,
                  "unit": "gram",
                  "value": 200.0
                }
              ]
            },
            {
              "id": 17,
              "in_basket": false,
              "name": "garlic",
              "quantities": [
                {
                  "id": 19,
                  "unit": "gram",
                  "value": 300.0
                }
              ]
            },
            {
              "id": 49,
              "in_basket": false,
              "name": "chicken thighs",
              "quantities": [
                {
                  "id": 20,
                  "unit": "gram",
                  "value": 400.0
                }
              ]
            },
            {
              "id": 52,
              "in_basket": true,
              "name": "bananas",
              "quantities": [
                {
                  "id": 16,
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

        let res = request.delete(&format!("/api/shoppinglists/{id}/ingredient")).json(&json!({
            "ingredient": "bananas",
        })).await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
        },
        @r###"
        {
          "id": 3,
          "ingredients": [
            {
              "id": 1,
              "in_basket": false,
              "name": "red onion",
              "quantities": [
                {
                  "id": 17,
                  "unit": "gram",
                  "value": 100.0
                }
              ]
            },
            {
              "id": 13,
              "in_basket": false,
              "name": "red pepper",
              "quantities": [
                {
                  "id": 18,
                  "unit": "gram",
                  "value": 200.0
                }
              ]
            },
            {
              "id": 17,
              "in_basket": false,
              "name": "garlic",
              "quantities": [
                {
                  "id": 19,
                  "unit": "gram",
                  "value": 300.0
                }
              ]
            },
            {
              "id": 49,
              "in_basket": false,
              "name": "chicken thighs",
              "quantities": [
                {
                  "id": 20,
                  "unit": "gram",
                  "value": 400.0
                }
              ]
            }
          ],
          "last_updated": "[date]",
          "name": "testing-shopping-list"
        }
        "###);

        let res = request.post(&format!("/api/shoppinglists/{id}/ingredient/49/quantity")).json(&json!({
            "quantity": "3.5 kg",
        })).await;
        assert_eq!(res.status_code(), 200);

        let res = request.get(&format!("/api/shoppinglists/{id}")).await;
        assert_eq!(res.status_code(), 200);
        assert_json_snapshot!(res.json::<serde_json::Value>(),
        {
            ".last_updated" => "[date]",
        },
        @r###"
        {
          "id": 3,
          "ingredients": [
            {
              "id": 1,
              "in_basket": false,
              "name": "red onion",
              "quantities": [
                {
                  "id": 17,
                  "unit": "gram",
                  "value": 100.0
                }
              ]
            },
            {
              "id": 13,
              "in_basket": false,
              "name": "red pepper",
              "quantities": [
                {
                  "id": 18,
                  "unit": "gram",
                  "value": 200.0
                }
              ]
            },
            {
              "id": 17,
              "in_basket": false,
              "name": "garlic",
              "quantities": [
                {
                  "id": 19,
                  "unit": "gram",
                  "value": 300.0
                }
              ]
            },
            {
              "id": 49,
              "in_basket": false,
              "name": "chicken thighs",
              "quantities": [
                {
                  "id": 20,
                  "unit": "gram",
                  "value": 400.0
                },
                {
                  "id": 21,
                  "unit": "kilogram",
                  "value": 3.5
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
