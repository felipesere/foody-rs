class Api::V1::MeController < ApplicationController
  # Identity of the currently signed-in user. Drives the SPA's auth guard:
  # a 401 here (via require_login) tells the frontend to bounce to login.
  def show
    render json: Payloads.user(Current.user)
  end
end
