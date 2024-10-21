use std::borrow::BorrowMut;

use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
enum Quantities {
    Table,
    Value,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        //manager
        //    .alter_table(
        //        Table::alter()
        //            .table(Quantities::Table)
        //            .modify_column(ColumnDef::new(Quantities::Value).float().borrow_mut())
        //            .to_owned(),
        //    )
        //    .await
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Quantities::Table)
                    .modify_column(ColumnDef::new(Quantities::Value).integer().borrow_mut())
                    .to_owned(),
            )
            .await
    }
}
