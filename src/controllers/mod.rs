use std::collections::HashSet;

use serde::Serialize;

pub mod auth;
pub mod user;

pub mod ingredients;

pub mod shoppinglists;

pub mod recipes;

pub mod mealplans;

#[derive(Serialize)]
pub struct TagsResponse {
    tags: HashSet<String>,
}
