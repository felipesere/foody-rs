require "rails_helper"

RSpec.describe Quantity do
  describe ".parse" do
    context "simple numeric quantities" do
      it("parses '1x' as a count") { expect(Quantity.parse("1x")).to eq(Quantity.new(unit: "count", value: 1.0)) }
      it("parses '1 x' as a count") { expect(Quantity.parse("1 x")).to eq(Quantity.new(unit: "count", value: 1.0)) }
      it("parses '1' as a count") { expect(Quantity.parse("1")).to eq(Quantity.new(unit: "count", value: 1.0)) }
      it("parses '1/2' as a count") { expect(Quantity.parse("1/2")).to eq(Quantity.new(unit: "count", value: 0.5)) }
      it("parses '0.5' as a count") { expect(Quantity.parse("0.5")).to eq(Quantity.new(unit: "count", value: 0.5)) }
    end

    context "weights" do
      it "parses '15g' as grams" do
        expect(Quantity.parse("15g")).to eq(Quantity.new(unit: "gram", value: 15.0))
      end

      it "parses '3.5 kg' as kilograms" do
        expect(Quantity.parse("3.5 kg")).to eq(Quantity.new(unit: "kilogram", value: 3.5))
      end

      it "passes through already-canonical units" do
        expect(Quantity.parse("1 kilogram")).to eq(Quantity.new(unit: "kilogram", value: 1.0))
      end
    end

    context "volumes" do
      it("parses '100ml'") { expect(Quantity.parse("100ml")).to eq(Quantity.new(unit: "millilitre", value: 100.0)) }
      it("parses '1l'") { expect(Quantity.parse("1l")).to eq(Quantity.new(unit: "litre", value: 1.0)) }
      it("parses '1 tbsp'") { expect(Quantity.parse("1 tbsp")).to eq(Quantity.new(unit: "tablespoon", value: 1.0)) }
      it("parses '1 cup'") { expect(Quantity.parse("1 cup")).to eq(Quantity.new(unit: "cup", value: 1.0)) }
      it("parses '1/2 cup'") { expect(Quantity.parse("1/2 cup")).to eq(Quantity.new(unit: "cup", value: 0.5)) }
    end

    context "arbitrary text" do
      it "falls back to arbitrary when nothing numeric matches" do
        expect(Quantity.parse("a pinch")).to eq(Quantity.new(unit: "arbitrary", text: "a pinch"))
      end
    end
  end

  describe "#to_attributes" do
    it "returns a hash matching the recipe_ingredients columns" do
      expect(Quantity.parse("15g").to_attributes).to eq(unit: "gram", value: 15.0, text: nil)
      expect(Quantity.parse("a pinch").to_attributes).to eq(unit: "arbitrary", value: nil, text: "a pinch")
    end
  end
end
