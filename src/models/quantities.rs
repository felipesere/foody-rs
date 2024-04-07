use regex_lite::Regex;
use sea_orm::entity::prelude::*;

pub use super::_entities::quantities::{self, ActiveModel, Entity, Model};

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

#[derive(Debug, PartialEq)]
pub enum Quantity {
    Count(f32),
    WithUnit { value: f32, unit: String },
    Arbitrary(String),
}

impl Quantity {
    pub fn parse(raw: &str) -> Self {
        let re = Regex::new(
            r" *(?<numerator>\d+\.?\d*) */? *(?<denominator>\d+\.?\d*)? *(?<unit>[^ ]+)?",
        )
        .unwrap();

        let Some(caps) = re.captures(raw) else {
            return Self::Arbitrary(raw.to_string());
        };

        let n: Option<f32> = caps.name("numerator").and_then(|m| m.as_str().parse().ok());
        let d: f32 = caps
            .name("denominator")
            .and_then(|m| m.as_str().parse().ok())
            .unwrap_or(1.0);
        let unit: Option<String> = caps.name("unit").map(|m| m.as_str().to_string());

        match (n, unit) {
            (None, _) => Self::Arbitrary(raw.to_string()),
            (Some(n), None) => Self::Count(n / d),
            (Some(n), Some(unit)) if &unit == "x" => Self::Count(n / d),
            (Some(n), Some(unit)) => Self::WithUnit {
                value: n / d,
                unit: canonical(&unit).to_string(),
            },
        }
    }

    pub fn into_active_model(self) -> ActiveModel {
        use sea_orm::ActiveValue::Set;

        match self {
            Self::Count(value) => ActiveModel {
                unit: Set("count".into()),
                value: Set(Some(value)), // Pretty sure this is wrong?!
                ..Default::default()
            },
            Self::WithUnit { value, unit } => ActiveModel {
                unit: Set(unit),
                value: Set(Some(value)), // Pretty sure this is wrong?!
                ..Default::default()
            },
            Self::Arbitrary(text) => ActiveModel {
                unit: Set("arbitrary".into()),
                text: Set(Some(text)),
                ..Default::default()
            },
        }
    }
}

fn canonical(unit: &str) -> &str {
    match unit {
        "kg" => "kilogram",
        "g" => "gram",
        "ml" => "millilitre",
        "l" => "litre",
        "tbsp" => "tablespoon",
        "tsp" => "teaspoon",
        "cups" => "cup",
        other => other,
    }
}

#[cfg(test)]
mod tests {
    use crate::models::quantities::Quantity;

    #[test]
    fn parses_simple_numeric_quantities() {
        let q = Quantity::parse("1x");
        assert_eq!(q, Quantity::Count(1.0));

        let q = Quantity::parse("1 x");
        assert_eq!(q, Quantity::Count(1.0));

        let q = Quantity::parse("1");
        assert_eq!(q, Quantity::Count(1.0));

        let q = Quantity::parse("1/2");
        assert_eq!(q, Quantity::Count(0.5));

        let q = Quantity::parse("0.5");
        assert_eq!(q, Quantity::Count(0.5));
    }

    #[test]
    fn parses_weights_in_units() {
        let q = Quantity::parse("15g");

        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 15.0,
                unit: "gram".into(),
            }
        );

        let q = Quantity::parse("3.5 kg");

        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 3.5,
                unit: "kilogram".into(),
            }
        );

        let q = Quantity::parse("1 kilogram");

        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 1.0,
                unit: "kilogram".into(),
            }
        );
    }

    #[test]
    fn parses_volume_in_units() {
        let q = Quantity::parse("100ml");

        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 100.0,
                unit: "millilitre".into()
            }
        );

        let q = Quantity::parse("1l");
        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 1.0,
                unit: "litre".into()
            }
        );

        let q = Quantity::parse("1 tbsp");
        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 1.0,
                unit: "tablespoon".into()
            }
        );

        let q = Quantity::parse("1 cup");
        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 1.0,
                unit: "cup".into()
            }
        );

        let q = Quantity::parse("1/2 cup");
        assert_eq!(
            q,
            Quantity::WithUnit {
                value: 0.5,
                unit: "cup".into()
            }
        );
    }
}
