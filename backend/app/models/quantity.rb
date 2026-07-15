class Quantity
  CANONICAL = {
    "kg" => "kilogram",
    "g" => "gram",
    "ml" => "millilitre",
    "l" => "litre",
    "tbsp" => "tablespoon",
    "tsp" => "teaspoon",
    "cups" => "cup"
  }.freeze

  PATTERN = / *(?<numerator>\d+\.?\d*) *\/? *(?<denominator>\d+\.?\d*)? *(?<unit>[^ ]+)? */

  attr_reader :unit, :value, :text

  def self.parse(raw)
    match = raw.match(PATTERN)

    if match.nil? || match[:numerator].nil?
      return new(unit: "arbitrary", text: raw)
    end

    n = match[:numerator].to_f
    d = (match[:denominator] || "1").to_f
    unit = match[:unit]

    value = n / d

    if unit.nil? || unit == "x"
      new(unit: "count", value: value)
    else
      new(unit: CANONICAL.fetch(unit, unit), value: value)
    end
  end

  def initialize(unit:, value: nil, text: nil)
    @unit = unit
    @value = value
    @text = text
  end

  def to_attributes
    {unit: unit, value: value, text: text}
  end

  def ==(other)
    other.is_a?(Quantity) && other.unit == unit && other.value == value && other.text == text
  end
end
