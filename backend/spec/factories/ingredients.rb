FactoryBot.define do
  factory :ingredient do
    name { "MyString" }
    aisle { nil }
    storage { nil }
    tags { "" }
    group { Current.group || association(:group) }
  end
end
