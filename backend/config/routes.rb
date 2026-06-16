Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :aisles, only: [:index, :create, :update, :destroy]
      resources :ingredients, only: [:index, :show, :create, :update, :destroy]
      resources :recipes, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get :tags
        end
        resources :ingredients,
                  only: [:create, :destroy],
                  controller: "recipe_ingredients"
      end
      resources :shoppinglists, only: [:index, :show, :create, :destroy] do
        post :clear, on: :member
        resources :items,
                  only: [:create, :update, :destroy],
                  controller: "shoppinglist_items" do
          resources :quantities,
                    only: [:create, :update, :destroy],
                    controller: "shoppinglist_quantities"
        end
        post   "recipes/:id", to: "shoppinglist_recipes#create",  as: :recipe
        delete "recipes/:id", to: "shoppinglist_recipes#destroy"
      end
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
