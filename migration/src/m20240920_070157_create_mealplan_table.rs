use loco_rs::schema::integer;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum MealPlans {
    Table,
    Id,
    Name,
}

#[derive(DeriveIden)]
enum MealsInMealPlans {
    Table,
    Id,
    MealPlanId,
    RecipeId,
    UntrackedMealName,
    IsCooked,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                table_auto(MealPlans::Table)
                    .col(pk_auto(MealPlans::Id))
                    .col(string(MealPlans::Name))
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                table_auto(MealsInMealPlans::Table)
                    .col(pk_auto(MealsInMealPlans::Id))
                    .col(integer(MealsInMealPlans::MealPlanId))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-mealplans-meals_in_mealplans")
                            .from(MealsInMealPlans::Table, MealsInMealPlans::MealPlanId)
                            .to(MealPlans::Table, MealPlans::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .col(integer_null(MealsInMealPlans::RecipeId))
                    .col(string_null(MealsInMealPlans::UntrackedMealName))
                    .col(boolean(MealsInMealPlans::IsCooked))
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(MealsInMealPlans::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(MealPlans::Table).to_owned())
            .await?;

        Ok(())
    }
}
