module Oidc
  # Fetches (and memoises per instance) the provider's OpenID discovery document
  # so we don't hard-code Pocket ID's endpoint paths.
  class Discovery
    def initialize(issuer)
      @issuer = issuer
    end

    def authorization_endpoint
      document.fetch("authorization_endpoint")
    end

    def token_endpoint
      document.fetch("token_endpoint")
    end

    def jwks_uri
      document.fetch("jwks_uri")
    end

    def end_session_endpoint
      document["end_session_endpoint"]
    end

    private

    def document
      @document ||= begin
        url = "#{@issuer.to_s.chomp('/')}/.well-known/openid-configuration"
        response = Faraday.get(url)
        raise Error, "OIDC discovery failed (#{response.status})" unless response.success?

        JSON.parse(response.body)
      end
    end
  end
end
