use axum::http::{header, HeaderValue};
use foody::app::App;
use insta::assert_json_snapshot;
use loco_rs::app::AppContext;
use loco_rs::testing;
use serial_test::serial;

async fn auth_token(ctx: &AppContext) -> String {
    let user = foody::models::users::users::Model::find_by_email(&ctx.db, "jim@example.com").await.unwrap();

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

        let token = auth_token(&ctx).await;

        request.add_header(header::AUTHORIZATION, HeaderValue::from_str(&format!("Bearer {token}")).unwrap());
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

// #[tokio::test]
// #[serial]
// async fn can_request_root() {
//     testing::request::<App, _, _>(|request, _ctx| async move {
//         let res = request.get("/shoppinglists").await;
//         assert_eq!(res.status_code(), 200);
//         assert_eq!(res.text(), "hello");
//     })
//     .await;
// }
