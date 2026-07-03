module Auth
  class SessionsController < ApplicationController
    # Login/callback happen before there's a session; logout needs one.
    skip_authentication only: %i[new callback]

    InvalidState = Class.new(StandardError)
    UnprovisionedUser = Class.new(StandardError)

    # GET /auth/login — stash a CSRF state token and bounce to Pocket ID.
    def new
      state = SecureRandom.urlsafe_base64(32)
      cookies.signed[:oidc_state] = {
        value: state,
        httponly: true,
        same_site: :lax,
        expires: 10.minutes.from_now
      }
      redirect_to Oidc::Client.new.authorize_url(state: state), allow_other_host: true
    end

    # GET /auth/callback — verify state, exchange the code, verify the ID token,
    # map the user, and start a Rails session.
    def callback
      verify_state!
      cookies.delete(:oidc_state)

      claims = Oidc::Client.new.exchange_and_verify(params[:code])
      start_new_session_for(user_for(claims))
      redirect_to "/"
    rescue InvalidState
      render json: { error: "invalid state" }, status: :bad_request
    rescue UnprovisionedUser
      render json: { error: "not provisioned" }, status: :forbidden
    rescue Oidc::Error, JWT::DecodeError
      render json: { error: "authentication failed" }, status: :unauthorized
    end

    # DELETE /auth/session
    def destroy
      terminate_session
      head :no_content
    end

    private

    def verify_state!
      expected = cookies.signed[:oidc_state]
      given = params[:state]
      raise InvalidState if expected.blank? || given.blank?
      raise InvalidState unless ActiveSupport::SecurityUtils.secure_compare(given, expected)
    end

    # Two-step lookup: stable oidc_subject first, then a pre-provisioned email
    # (stamping the subject permanently). An unknown email is not provisioned.
    def user_for(claims)
      if (user = User.find_by(oidc_subject: claims[:sub]))
        return user
      end

      user = User.find_by(email: claims[:email], oidc_subject: nil)
      raise UnprovisionedUser if user.nil?

      user.update!(oidc_subject: claims[:sub])
      user
    end
  end
end
