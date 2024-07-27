use std::collections::{BTreeSet, HashMap};

use super::_entities;
use super::_entities::ingredients::Model as Ingredient;
use super::_entities::quantities::Model as Quantity;
use super::_entities::recipes::{ActiveModel, Model as Recipes};
use loco_rs::model::ModelError;
use sea_orm::entity::prelude::*;
use sea_orm::{DbBackend, FromQueryResult, Statement};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

/// The connection between `recipes` and `tags`
struct RecipeToTags;

impl Linked for RecipeToTags {
    type FromEntity = _entities::recipes::Entity;
    type ToEntity = _entities::tags::Entity;

    fn link(&self) -> Vec<sea_orm::LinkDef> {
        vec![
            super::_entities::tags_on_recipes::Relation::Recipes
                .def()
                .rev(),
            super::_entities::tags_on_recipes::Relation::Tags.def(),
        ]
    }
}

// TODO: Turn this into an actual struct with proper names
type FullRecipe = (Recipes, Vec<(Ingredient, Quantity)>, BTreeSet<String>);

pub(crate) async fn find_all(db: &DatabaseConnection) -> Result<Vec<FullRecipe>, ModelError> {
    let backend = db.get_database_backend();

    let tags_statement = Statement::from_string(
        backend,
        r#"
        SELECT
            recipe_id,
            t.name as t_name
        FROM tags_on_recipes
            JOIN tags as t on tags_on_recipes.tag_id = t.id
    "#,
    );
    let rows = &db.query_all(tags_statement).await?;
    let mut tagged_recipes = HashMap::new();
    for row in rows {
        let recipe_id: i32 = row.try_get("", "recipe_id")?;
        let tag: String = row.try_get("t_", "name")?;
        tagged_recipes
            .entry(recipe_id)
            .or_insert_with(BTreeSet::new)
            .insert(tag);
    }

    let ingredients_with_quantities = Statement::from_string(
        backend,
        r#"
        SELECT recipes_id,
               i.created_at as i_created_at,
               i.updated_at as i_updated_at,
               i.id as i_id,
               i.name as i_name,
               q.created_at as q_created_at,
               q.updated_at as q_updated_at,
               q.id as q_id,
               q.text as q_text,
               q.unit as q_unit,
               q.value as q_value
        FROM ingredients_in_recipes
                 JOIN ingredients i ON ingredients_in_recipes.ingredients_id = i.id
                 JOIN quantities q ON q.id = ingredients_in_recipes.quantities_id
    "#,
    );

    let rows = &db.query_all(ingredients_with_quantities).await;
    let mut ingredients_for_recipes = HashMap::new();
    for row in rows {
        let recipe_id: i32 = row.try_get("", "recipes_id")?;
        let ingredient = _entities::ingredients::Model::from_query_result(row, "i_")?;
        let quantity = _entities::quantities::Model::from_query_result(row, "q_")?;
        ingredients_for_recipes
            .entry(recipe_id)
            .or_insert_with(Vec::new)
            .push((ingredient, quantity));
    }

    let recipes = _entities::recipes::Entity::find().all(db).await?;

    let mut full_recipes = Vec::new();
    for recipe in recipes {
        let its_tags = tagged_recipes.get(&recipe.id).cloned().unwrap_or_default();
        let its_ingredients = ingredients_for_recipes
            .get(&recipe.id)
            .cloned()
            .unwrap_or_default();

        full_recipes.push((recipe, its_ingredients, its_tags));
    }

    Ok(full_recipes)
}

// TODO: actually join in on the tags!
pub(crate) async fn find_one(
    db: &DatabaseConnection,
    id: i32,
) -> Result<Option<FullRecipe>, ModelError> {
    let recipe = _entities::recipes::Entity::find_by_id(id)
        .one(db)
        .await?
        .ok_or_else(|| loco_rs::model::ModelError::EntityNotFound)?;

    let tags = recipe.find_linked(RecipeToTags).all(db).await?;

    let backend = db.get_database_backend();

    let ingredients_with_quantities = Statement::from_sql_and_values(
        backend,
        r#"
                SELECT
                       "i"."created_at" AS "I_created_at",
                       "i"."updated_at" AS "I_updated_at",
                       "i"."id"         AS "I_id",
                       "i"."name"       AS "I_name",
                       "q"."created_at" AS "Q_created_at",
                       "q"."updated_at" AS "Q_updated_at",
                       "q"."id"         AS "Q_id",
                       "q"."unit"       AS "Q_unit",
                       "q"."value"      AS "Q_value",
                       "q"."text"       AS "Q_text"
                    FROM "ingredients_in_recipes"
                        JOIN "ingredients" i on i.id = ingredients_in_recipes.ingredients_id
                        JOIN "quantities"  q on q.id = ingredients_in_recipes.quantities_id
                WHERE "ingredients_in_recipes"."recipes_id" = $1
        "#,
        vec![id.into()],
    );
    let rows = &db.query_all(ingredients_with_quantities).await?;
    let mut ingredients: Vec<(Ingredient, Quantity)> = Vec::new();

    for row in rows {
        let ingredient = Ingredient::from_query_result(row, "I_")?;
        let quantity = Quantity::from_query_result(row, "Q_")?;
        ingredients.push((ingredient, quantity));
    }

    Ok(Some((
        recipe,
        ingredients,
        tags.into_iter().map(|t| t.name).collect(),
    )))
}
