Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get  "me",     to: "me#show"
      post "import", to: "import#create"

      resources :aisles, only: [:index, :create, :update, :destroy]
      resources :storages, only: [:index, :create, :update, :destroy]
      resources :ingredients, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get :tags
        end
        member do
          post :merge
        end
      end
      resources :recipes, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get :tags
        end
        resources :ingredients,
                  only: [:create, :destroy],
                  controller: "recipe_ingredients"
      end
      resources :mealplans, only: [:index, :show, :create, :destroy] do
        post :clear, on: :member
        resources :meals,
                  only: [:create, :update, :destroy],
                  controller: "mealplan_meals"
        post   "shoppinglists/:id", to: "mealplan_shoppinglists#create", as: :shoppinglist
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

  # Pocket ID OIDC login flow.
  get    "auth/login",    to: "auth/sessions#new"
  get    "auth/callback", to: "auth/sessions#callback"
  delete "auth/session",  to: "auth/sessions#destroy"

  # Dev/test-only login bypass (see Dev::SessionsController). Never mounted in
  # production.
  if Rails.env.local?
    post "dev/login", to: "dev/sessions#create"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # SPA fallback: serve the built Vite bundle (public/index.html) for any GET that
  # isn't an API/auth/health path, so client-side routes like /recipes/5 deep-link.
  # Static assets that exist in public/ are served by the static middleware before
  # they ever reach this route.
  get "*path", to: "spa#index", constraints: ->(request) {
    !request.path.match?(%r{\A/(api|auth|dev|up|rails)(/|\z)})
  }
  root "spa#index"
end
