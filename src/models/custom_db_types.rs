use std::str::FromStr;

use sea_orm::TryGetableFromJson;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct JsonStringArray(pub Vec<String>);

impl JsonStringArray {
    pub fn to_vec(self) -> Vec<String> {
        self.0
    }
}

impl From<Vec<String>> for JsonStringArray {
    fn from(value: Vec<String>) -> Self {
        Self(value)
    }
}

impl TryGetableFromJson for JsonStringArray {}

impl std::convert::From<JsonStringArray> for sea_orm::Value {
    fn from(value: JsonStringArray) -> Self {
        Self::Json(serde_json::to_value(&value).ok().map(Box::new))
    }
}

impl sea_orm::sea_query::ValueType for JsonStringArray {
    fn try_from(v: sea_orm::Value) -> Result<Self, sea_query::ValueTypeErr> {
        match v {
            sea_orm::Value::Json(Some(value)) => {
                serde_json::from_value(*value).map_err(|_err| sea_orm::sea_query::ValueTypeErr)
            }
            _ => Err(sea_orm::sea_query::ValueTypeErr),
        }
    }

    fn type_name() -> String {
        "Text".to_string()
    }

    fn array_type() -> sea_query::ArrayType {
        sea_query::ArrayType::Json
    }

    fn column_type() -> sea_orm::ColumnType {
        sea_orm::sea_query::ColumnType::Json
    }
}

// Implement FromStr to parse the DB string
impl FromStr for JsonStringArray {
    type Err = Box<dyn std::error::Error>;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.is_empty() {
            return Ok(Self(vec![]));
        }

        let value: Vec<String> = serde_json::from_str(s)?;

        Ok(Self(value))
    }
}
