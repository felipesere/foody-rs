FactoryBot.define do
  factory :recipe do
    sequence(:name) { |n| "Recipe #{n}" }
    source { "book" }
    book_title { "The Cookbook" }
    book_page  { 42 }
    tags    { [] }
    rating  { 0 }
    notes   { "" }

    trait :website do
      source { "website" }
      book_title { nil }
      book_page  { nil }
      website_url { "https://example.com/recipe" }
    end
  end
end
