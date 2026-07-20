FactoryBot.define do
  factory :aisle do
    sequence(:name) { |n| "Aisle #{n}" }
    sequence(:order) { |n| n }
    group { Current.group || association(:group) }
  end
end
