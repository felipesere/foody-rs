# Pocket ID (OIDC) configuration. Endpoints are discovered from the issuer at
# runtime; only these four values are configured. Left blank outside production
# so the app boots without them (the OIDC flow is only exercised on login).
Rails.application.config.oidc = ActiveSupport::OrderedOptions.new
Rails.application.config.oidc.issuer        = ENV["OIDC_ISSUER"]
Rails.application.config.oidc.client_id     = ENV["OIDC_CLIENT_ID"]
Rails.application.config.oidc.client_secret = ENV["OIDC_CLIENT_SECRET"]
Rails.application.config.oidc.redirect_uri  = ENV["OIDC_REDIRECT_URI"]
