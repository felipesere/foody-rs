FactoryBot.define do
  factory :storage_location do
    sequence(:name) { |n| "Storage #{n}" }
    sequence(:order) { |n| n }
    group { Current.group || association(:group) }
  end
end
