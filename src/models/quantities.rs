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
        if let Some(value) = parse_value(raw) {
            return Self::Count(value);
        }
        if let Some(weight) = parse_weight(raw) {
            return weight;
        }

        if let Some(volume) = parse_volume(raw) {
            return volume;
        }

        Self::Arbitrary(raw.to_string())
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

fn parse_value(raw: &str) -> Option<f32> {
    if let Some((left, right)) = raw.split_once('/') {
        let x: f32 = left.parse().ok()?;
        let y: f32 = right.parse().ok()?;

        return Some(x / y);
    }

    raw.parse().ok()
}

fn parse_weight(raw: &str) -> Option<Quantity> {
    let (value, unit) = extract_value_and_unit(
        raw,
        &[
            ("kg", "kilogram"),
            ("g", "gram"),
            ("cloves", "cloves"), /* TODO: this does not fit here */
        ],
    )?;

    Some(Quantity::WithUnit { value, unit })
}

fn parse_volume(raw: &str) -> Option<Quantity> {
    let (value, unit) = extract_value_and_unit(
        raw,
        &[
            ("ml", "millilitre"),
            ("l", "litre"),
            ("tbsp", "tablespoon"),
            ("tsp", "teaspoon"),
            ("cup", "cup"),
            ("cups", "cup"),
        ],
    )?;

    Some(Quantity::WithUnit { value, unit })
}

fn extract_value_and_unit(raw: &str, symbol_to_unit: &[(&str, &str)]) -> Option<(f32, String)> {
    let trimmed = raw.trim();

    for (symbol, unit) in symbol_to_unit {
        if trimmed.contains(symbol) {
            let trimmed = trimmed.replace(symbol, "");
            let without_unit = trimmed.trim();

            if let Some(value) = parse_value(without_unit) {
                return Some((value, unit.to_string()));
            }
        }

        if trimmed.contains(unit) {
            let trimmed = trimmed.replace(unit, "");
            let without_unit = trimmed.trim();

            if let Some(value) = parse_value(without_unit) {
                return Some((value, unit.to_string()));
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use crate::models::quantities::Quantity;

    #[test]
    fn parses_simple_numeric_quantities() {
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
