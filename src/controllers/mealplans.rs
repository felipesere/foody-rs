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
        MealPlanResponse {
            id: mealplan.id,
            name: mealplan.name,
            meals: meals
                .into_iter()
                .map(|m| {
                    if let Some(recipe_id) = m.recipe_id {
                        Meal {
                            id: m.id,
                            details: MealDetails::FromRecipe(Recipe { id: recipe_id }),
                            section: m.section,
                        }
                    } else {
                        Meal {
                            id: m.id,
                            details: MealDetails::Untracked(UntrackedMeal {
                                name: m.untracked_meal_name.expect(
                                    "meal was had no recipe_id and was meant to be untracked",
                                ),
                            }),
                            section: m.section,
                        }
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
        MealPlansResponse {
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

pub fn routes() -> Routes {
    Routes::new()
        .prefix("mealplans")
        .add("/", get(all_mealplans))
        .add("/", post(create_meal_plan))
        .add("/:id/meal", post(add_to_meal))
}

#[cfg(test)]
mod tests {
    use insta::assert_json_snapshot;

    use crate::controllers::mealplans::MealDetails;

    use super::{Meal, MealPlanResponse, MealPlansResponse, Recipe, UntrackedMeal};

    #[test]
    fn produces_the_right_shape_of_json() {
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
                        },
                        Meal {
                            id: 91,
                            details: MealDetails::Untracked(UntrackedMeal {
                                name: "FrozenBanana".to_string(),
                            }),
                            section: None,
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
                    }],
                },
            ],
        };

        assert_json_snapshot!(&meal_plans);
    }
}