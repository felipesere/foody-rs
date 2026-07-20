module Oidc
  class Error < StandardError; end

  def self.config
    Rails.application.config.oidc
  end
end
