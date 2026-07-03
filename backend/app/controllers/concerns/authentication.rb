module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_login
  end

  class_methods do
    def skip_authentication(**options)
      skip_before_action :require_login, **options
    end
  end

  private

  def require_login
    resume_session || request_authentication
  end

  def resume_session
    Current.session = find_session_by_cookie
  end

  def find_session_by_cookie
    return unless (id = cookies.signed[:session_id])

    Session.find_by(id: id)
  end

  def request_authentication
    render json: { error: "unauthorized" }, status: :unauthorized
  end

  def start_new_session_for(user)
    user.sessions.create!.tap do |session|
      Current.session = session
      cookies.signed.permanent[:session_id] = {
        value: session.id,
        httponly: true,
        same_site: :lax,
      }
    end
  end
end
