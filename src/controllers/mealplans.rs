use axum::{
    extract::{self, State},
    routing::get,
};
use loco_rs::{controller::middleware, prelude::*};
use serde::{Deserialize, Serialize};

use crate::models::{
    _entities::{meal_plans, meals_in_meal_plans},
    users,
};

#[derive(Serialize, Deserialize, Debug)]
struct Recipe {
    id: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct UntrackedMeal {
    name: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Meal {
    id: i32,
    details: MealDetails,
    section: Option<String>,
    is_cooked: bool,
    created_at: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case", tag = "type")]
enum MealDetails {
    FromRecipe(Recipe),
    Untracked(UntrackedMeal),
}

#[derive(Serialize, Deserialize, Debug)]
struct MealPlanResponse {
    id: i32,
    name: String,
    meals: Vec<Meal>,
}

#[derive(Serialize, Deserialize, Debug)]
struct MealPlansResponse {
    meal_plans: Vec<MealPlanResponse>,
}

impl From<(meal_plans::Model, Vec<meals_in_meal_plans::Model>)> for MealPlanResponse {
    fn from(value: (meal_plans::Model, Vec<meals_in_meal_plans::Model>)) -> Self {
        let (mealplan, meals) = value;
        Self {
            id: mealplan.id,
            name: mealplan.name,
            meals: meals
                .into_iter()
                .map(|m| {
                    let details = if let Some(recipe_id) = m.recipe_id {
                        MealDetails::FromRecipe(Recipe { id: recipe_id })
                    } else {
                        MealDetails::Untracked(UntrackedMeal {
                            name: m
                                .untracked_meal_name
                                .expect("meal was had no recipe_id and was meant to be untracked"),
                        })
                    };

                    Meal {
                        id: m.id,
                        details,
                        section: m.section,
                        is_cooked: m.is_cooked,
                        created_at: m.created_at.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
                    }
                })
                .collect(),
        }
    }
}

impl<T> From<Vec<T>> for MealPlansResponse
where
    T: Into<MealPlanResponse>,
{
    fn from(value: Vec<T>) -> Self {
        Self {
            meal_plans: value.into_iter().map(|m| m.into()).collect(),
        }
    }
}

pub async fn all_mealplans(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let plans = meal_plans::Entity::find()
        .find_with_related(meals_in_meal_plans::Entity)
        .all(&ctx.db)
        .await?;

    format::json(MealPlansResponse::from(plans))
}

#[derive(Deserialize)]
pub struct NewMealPlan {
    name: String,
}

pub async fn create_meal_plan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    extract::Json(params): extract::Json<NewMealPlan>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    meal_plans::ActiveModel {
        name: ActiveValue::Set(params.name),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await?;

    Ok(())
}

#[derive(Deserialize)]
pub struct AddMealParams {
    details: MealDetails,
    section: Option<String>,
}

pub async fn add_to_meal(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    extract::Json(meal): extract::Json<AddMealParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal_to_be_added = meals_in_meal_plans::ActiveModel {
        meal_plan_id: ActiveValue::Set(id),
        is_cooked: ActiveValue::Set(false),
        section: ActiveValue::Set(meal.section),
        ..Default::default()
    };

    match meal.details {
        MealDetails::FromRecipe(recipe) => {
            // TODO: Check if the recipe exists?
            meal_to_be_added.recipe_id = ActiveValue::Set(Some(recipe.id));
            meal_to_be_added.untracked_meal_name = ActiveValue::Set(None);
        }
        MealDetails::Untracked(n) => {
            meal_to_be_added.recipe_id = ActiveValue::Set(None);
            meal_to_be_added.untracked_meal_name = ActiveValue::Set(Some(n.name));
        }
    };

    meal_to_be_added.save(&ctx.db).await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct MarkMealAsCookedParams {
    is_cooked: bool,
}

pub async fn mark_meal_as_cooked(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
    extract::Json(mark): extract::Json<MarkMealAsCookedParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let meal = meals_in_meal_plans::Entity::find_by_id(meal_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal = meal.into_active_model();
    meal.is_cooked = ActiveValue::Set(mark.is_cooked);
    meal.save(&ctx.db).await?;

    Ok(())
}

pub async fn delete_meal_from_mealplan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    meals_in_meal_plans::Entity::delete_by_id(meal_id)
        .exec(&ctx.db)
        .await?;

    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct SetMealOfSectionParams {
    section: String,
}

pub async fn set_section_of_meal(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path((id, meal_id)): Path<(i32, i32)>,
    extract::Json(SetMealOfSectionParams { section }): extract::Json<SetMealOfSectionParams>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let meal = meals_in_meal_plans::Entity::find_by_id(meal_id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut meal = meal.into_active_model();
    meal.section = ActiveValue::Set(Some(section));
    meal.save(&ctx.db).await?;

    Ok(())
}

// TODO this is more of an interim thing anyway...
pub async fn clear_meal_plan(
    auth: middleware::auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<()> {
    let _user = users::Model::find_by_pid(&ctx.db, &auth.claims.pid).await?;

    let _plan = meal_plans::Entity::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    meals_in_meal_plans::Entity::delete_many()
        .filter(meals_in_meal_plans::Column::MealPlanId.eq(id))
        .exec(&ctx.db)
        .await?;

    Ok(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("mealplans")
        .add("/", get(all_mealplans))
        .add("/", post(create_meal_plan))
        .add("/:id/clear", post(clear_meal_plan))
        .add("/:id/meal", post(add_to_meal))
        .add("/:id/meal/:meal_id", delete(delete_meal_from_mealplan))
        .add("/:id/meal/:meal_id/cooked", post(mark_meal_as_cooked))
        .add("/:id/meal/:meal_id/section", post(set_section_of_meal))
}

#[cfg(test)]
mod tests {
    use insta::assert_json_snapshot;

    use crate::controllers::mealplans::MealDetails;

    use super::{Meal, MealPlanResponse, MealPlansResponse, Recipe, UntrackedMeal};

    #[test]
    fn produces_the_right_shape_of_json() {
        let created_at = "2024-01-22 17:34:01";
        let meal_plans = MealPlansResponse {
            meal_plans: vec![
                MealPlanResponse {
                    id: 1,
                    name: "the first".to_string(),
                    meals: vec![
                        Meal {
                            id: 90,
                            details: MealDetails::FromRecipe(Recipe { id: 10 }),
                            section: None,
                            is_cooked: true,
                            created_at: created_at.to_string(),
                        },
                        Meal {
                            id: 91,
                            details: MealDetails::Untracked(UntrackedMeal {
                                name: "FrozenBanana".to_string(),
                            }),
                            section: None,
                            is_cooked: false,
                            created_at: created_at.to_string(),
                        },
                    ],
                },
                MealPlanResponse {
                    id: 2,
                    name: "the second".to_string(),
                    meals: vec![Meal {
                        id: 91,
                        details: MealDetails::FromRecipe(Recipe { id: 11 }),
                        section: None,
                        is_cooked: false,
                        created_at: created_at.to_string(),
                    }],
                },
            ],
        };

        assert_json_snapshot!(&meal_plans);
    }
}
