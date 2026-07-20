module Dev
  # Dev/test-only login bypass so `bin/rails server` and the test suite don't
  # need Pocket ID. The route is only mounted when `Rails.env.local?`, and this
  # action re-checks as a second lock so it can never fire in production.
  class SessionsController < ApplicationController
    skip_authentication

    def create
      raise "dev login is only available in local environments" unless Rails.env.local?

      user = User.find_by!(email: params.require(:as))
      start_new_session_for(user)
      head :ok
    end
  end
end
