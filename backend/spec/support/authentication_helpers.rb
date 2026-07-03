module AuthenticationHelpers
  # Establishes a real session for request specs by going through the dev-login
  # path, so the signed cookie is set exactly like production. Called with no
  # argument, it signs in a default user; specs that care about a specific
  # user/group pass one in.
  #
  # It also sets Current in the test process so records built in the spec body
  # (outside a request) are stamped with the signed-in user's group.
  def sign_in(user = nil)
    user ||= default_test_user
    post "/dev/login", params: { as: user.email }
    Current.session = user.sessions.order(:created_at).last
    user
  end

  def default_test_user
    group = Group.find_or_create_by!(name: "Test Group")
    User.find_or_create_by!(email: "test@example.com") do |user|
      user.name = "Test User"
      user.group = group
    end
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request

  config.before(:each, type: :request) { sign_in }
end
