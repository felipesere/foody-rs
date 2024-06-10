use std::collections::BTreeMap;

use crate::models::{
    _entities::{ingredients::Column, prelude::*, tags_on_ingredients},
    ingredients::IngredientToTags,
};
use loco_rs::prelude::*;
use sea_orm::{QueryOrder, QuerySelect};
use tokio::task::JoinHandle;

pub struct Tagger;
#[async_trait]
impl Task for Tagger {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "tagger".to_string(),
            detail: "Task generator".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, _vars: &BTreeMap<String, String>) -> Result<()> {
        let other = app_context.db.clone();
        let existing_tags = Tags::find().all(&app_context.db).await?;
        let mut tags: Vec<_> = existing_tags.iter().map(|t| t.name.clone()).collect();
        tags.sort();
        tags.insert(0, "SKIP".to_string());
        let skip_item = 0;

        let x: String = dialoguer::Input::new()
            .with_prompt("Which index do we start from?")
            .with_initial_text("0")
            .interact()
            .expect("to get input from user");

        let ingredients_to_skip = x.parse::<u64>().expect("input to have been a number");

        let ingredient_with_tag = Ingredients::find()
            .order_by_asc(Column::Name)
            .offset(Some(ingredients_to_skip))
            .find_with_linked(IngredientToTags)
            .all(&app_context.db)
            .await?;

        let (handle, tx) = DbTagger::spawn(other);

        for (idx, (ingredient, ingredient_tags)) in ingredient_with_tag.iter().enumerate() {
            if !ingredient_tags.is_empty() {
                continue;
            }

            let checked_tags: Vec<_> = tags
                .clone()
                .into_iter()
                .map(|t| {
                    let is_checked = ingredient_tags.iter().any(|tag| tag.name == t);
                    (t, is_checked)
                })
                .collect();

            let tagged = dialoguer::MultiSelect::new()
                .items_checked(&checked_tags)
                .with_prompt(format!(
                    "[{} of {}] Tags for {}",
                    ingredients_to_skip + idx as u64,
                    ingredient_with_tag.len() - 1,
                    ingredient.name
                ))
                .interact()
                .unwrap();

            if tagged.contains(&skip_item) {
                continue;
            }

            let mut tag_ids = Vec::new();
            for tag_idx in tagged {
                let name = &checked_tags[tag_idx].0;
                let id = existing_tags
                    .iter()
                    .find(|t| &t.name == name)
                    .expect("to find matching tag model")
                    .id;

                tag_ids.push(id);
            }

            tx.send(Msg::Work(ItemToTag {
                ingredient_id: ingredient.id,
                tag_ids,
            }))
            .expect("Failed to send work item to queue");
        }

        tx.send(Msg::Done).expect("sending message to terminate...");

        handle.await.expect("wait for tagger worker to end");

        Ok(())
    }
}

enum Msg {
    Work(ItemToTag),
    Done,
}

struct ItemToTag {
    ingredient_id: i32,
    tag_ids: Vec<i32>,
}

struct DbTagger {
    db: DatabaseConnection,
    rx: tokio::sync::mpsc::UnboundedReceiver<Msg>,
}

impl DbTagger {
    fn spawn(
        conn: DatabaseConnection,
    ) -> (JoinHandle<()>, tokio::sync::mpsc::UnboundedSender<Msg>) {
        let (tx, rx) = tokio::sync::mpsc::unbounded_channel();

        let tagger = Self { db: conn, rx };

        let fut = move || async {
            let mut this = tagger;
            loop {
                let msg = this.rx.recv().await;

                match msg {
                    Some(Msg::Work(item)) => {
                        handle_item(&this.db, item)
                            .await
                            .expect("to insert the item");
                    }
                    Some(Msg::Done) => {
                        break;
                    }
                    None => {
                        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                    }
                }
            }
        };

        let handle = tokio::spawn(fut());

        (handle, tx)
    }
}

async fn handle_item(conn: &DatabaseConnection, item: ItemToTag) -> Result<(), loco_rs::Error> {
    let tx = conn.begin().await?;

    tags_on_ingredients::Entity::delete_many()
        .filter(tags_on_ingredients::Column::IngredientId.eq(item.ingredient_id))
        .exec(&tx)
        .await?;

    for tag_id in item.tag_ids {
        crate::models::_entities::tags_on_ingredients::ActiveModel {
            tag_id: ActiveValue::Set(tag_id),
            ingredient_id: ActiveValue::Set(item.ingredient_id),
            ..Default::default()
        }
        .insert(&tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}
