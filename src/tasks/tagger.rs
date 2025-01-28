use crate::models::{
    _entities::{
        ingredients::{self, Column},
        prelude::*,
    },
    ingredients::all_tags,
};
use loco_rs::prelude::*;
use migration::Expr;
use sea_orm::{QueryOrder, QuerySelect};
use task::Vars;
use tokio::task::JoinHandle;

pub struct Tagger;
#[async_trait]
impl Task for Tagger {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "tagger".to_string(),
            detail: "Prompts user to tag items on DB".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, _vars: &Vars) -> Result<()> {
        let conn = app_context.db.clone();
        let mut tags = all_tags(&conn).await?;
        tags.sort();
        tags.insert(0, "SKIP".to_string());
        let skip_item = 0;

        let user_input: String = dialoguer::Input::new()
            .with_prompt("Which index do we start from?")
            .with_initial_text("0")
            .interact()
            .expect("to get input from user");

        let ingredients_to_skip = user_input
            .parse::<u64>()
            .expect("input to have been a number");

        let ingredients = Ingredients::find()
            .order_by_asc(Column::Name)
            .offset(Some(ingredients_to_skip))
            .all(&app_context.db)
            .await?;

        let (handle, tx) = DbTagger::spawn(conn);

        for (idx, ingredient) in ingredients.iter().enumerate() {
            if !ingredient.tags.is_empty() {
                continue;
            }

            let checked_tags: Vec<_> = tags
                .clone()
                .into_iter()
                .map(|t| {
                    let is_checked = ingredient.tags.iter().any(|tag| tag == &t);
                    (t, is_checked)
                })
                .collect();

            let tagged = dialoguer::MultiSelect::new()
                .items_checked(&checked_tags)
                .with_prompt(format!(
                    "[{} of {}] Tags for {}",
                    ingredients_to_skip + idx as u64,
                    ingredients.len() - 1,
                    ingredient.name
                ))
                .interact()
                .unwrap();

            if tagged.contains(&skip_item) {
                continue;
            }

            let mut new_tags = Vec::new();
            for tag_idx in tagged {
                let name = &checked_tags[tag_idx].0;
                new_tags.push(name.clone());
            }

            tx.send(Msg::Work(ItemToTag {
                ingredient_id: ingredient.id,
                new_tags,
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
    new_tags: Vec<String>,
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
    ingredients::Entity::update_many()
        .col_expr(ingredients::Column::Tags, Expr::value(item.new_tags))
        .filter(ingredients::Column::Id.eq(item.ingredient_id))
        .exec(conn)
        .await?;
    Ok(())
}
