module AuthenticationHelpers
  def sign_in(_user = nil)
    nil
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request

  # Route every request spec through sign_in so the real implementation later
  # authenticates them all at once. Specs that need a specific user can call
  # sign_in(user) explicitly.
  config.before(:each, type: :request) { sign_in }
end
