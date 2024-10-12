// add future tests here

use crate::requests::prepare_data;
use foody::{
    app::App,
    controllers::recipes::{RecipeResponse, RecipesResponse},
    models::_entities,
};
use loco_rs::testing;
use sea_orm::{prelude::*, EntityTrait, QueryFilter};
use serial_test::serial;

async fn named_ingredient(db: &DatabaseConnection, name: &str) -> _entities::ingredients::Model {
    _entities::ingredients::Entity::find()
        .filter(_entities::ingredients::Column::Name.eq(name))
        .one(db)
        .await
        .expect("DB operation failed")
        .unwrap_or_else(|| panic!("did not find {name}"))
}

#[tokio::test]
#[serial]
async fn can_create_and_update_a_recipe() {
    testing::request::<App, _, _>(|mut request, ctx| async move {
        testing::seed::<App>(&ctx.db).await.unwrap();

        prepare_data::authenticated(&mut request, &ctx).await;

        let bacon = named_ingredient(&ctx.db, "bacon").await;
        let apples = named_ingredient(&ctx.db, "apples").await;
        let plums = named_ingredient(&ctx.db, "plums").await;

        let something_recipe = serde_json::json!({
            "name": "something something",
            "title": "simplissime",
            "tags": ["a", "b"],
            "page": 12,
            "notes": "a b c...",
            "rating": 1,
            "source": "book",
            "ingredients": [{
              "id": bacon.id,
              "quantity": [{
                "unit": "grams",
                "value": 100,
              }]
            },
            {
              "id": apples.id,
              "quantity": [{
                "unit": "grams",
                "value": 140,
              }]
            },
            {
              "id": plums.id,
              "quantity": [{
                    "unit": "count",
                    "value": 0.5,
              }]
            }
            ]
        });

        let res = request.post("/api/recipes").json(&something_recipe).await;
        let t = res.text();
        dbg!(&t);
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
            .post(&format!("/api/recipes/{id}"))
            .json(&serde_json::json!({
                "name": "something something",
                "title": "simplissime",
                "page": 12,
                "ingredients": [{
                  "id": bacon.id,
                  "quantity": "100g"
                },
                {
                  "id": apples.id,
                  "quantity": "140g"
                },
                {
                  "id": plums.id,
                  "quantity": "0.5x"
                }
                ],
                "tags": ["alpha", "bravo", "charlie"]
            }))
            .await;
        assert_eq!(res.status_code(), 200);

        let something_something = res.json::<RecipeResponse>();
        assert_eq!(something_something.ingredients.len(), 3);
        assert_eq!(something_something.tags.len(), 3);
    })
    .await;
}
