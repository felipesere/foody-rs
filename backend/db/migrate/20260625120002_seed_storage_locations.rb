class SeedStorageLocations < ActiveRecord::Migration[8.1]
  LOCATIONS = [
    ["fridge",        1],
    ["freezer",       2],
    ["top pantry",    3],
    ["bottom pantry", 4],
    ["fruits",        5],
    ["bread & tea",   6]
  ].freeze

  def up
    now = Time.current
    rows = LOCATIONS.map do |name, order|
      { name: name, order: order, created_at: now, updated_at: now }
    end
    StorageLocation.insert_all(rows)
  end

  def down
    StorageLocation.where(name: LOCATIONS.map(&:first)).delete_all
  end
end
