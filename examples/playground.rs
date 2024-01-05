use eyre::Context;
use foody::{
    app::App,
    models::_entities::{ingredients, ingredients_in_shoppinglists, quantities, shoppinglists},
};
use loco_rs::{cli::playground, prelude::*};
use sea_orm::TransactionTrait;

#[tokio::main]
async fn main() -> eyre::Result<()> {
    let ctx = playground::<App>().await.context("playground")?;

    let tx = ctx.db.begin().await?;

    let apple = ingredients::ActiveModel {
        name: Set("apple".to_string()),
        ..Default::default()
    }
    .insert(&tx)
    .await
    .unwrap();

    let two_kg = quantities::ActiveModel {
        unit: Set("kg".to_string()),
        value: Set(Some(2)),
        ..Default::default()
    }
    .insert(&tx)
    .await
    .unwrap();

    let monday_shop = shoppinglists::ActiveModel {
        name: Set("monday_shop".to_string()),
        ..Default::default()
    }
    .insert(&tx)
    .await
    .unwrap();

    let x = ingredients_in_shoppinglists::ActiveModel {
        in_basket: Set(false),
        shoppinglists_id: Set(monday_shop.id),
        ingredients_id: Set(apple.id),
        quantities_id: Set(two_kg.id),
        ..Default::default()
    }
    .insert(&tx)
    .await
    .unwrap();

    tx.commit().await.unwrap();

    // let active_model: articles::ActiveModel = ActiveModel {
    //     title: Set(Some("how to build apps in 3 steps".to_string())),
    //     content: Set(Some("use Loco: https://loco.rs".to_string())),
    //     ..Default::default()
    // };
    // active_model.insert(&ctx.db).await.unwrap();

    // let res = articles::Entity::find().all(&ctx.db).await.unwrap();
    // println!("{:?}", res);
    println!("welcome to playground. edit me at `examples/playground.rs`");

    Ok(())
}
