module Oidc
  # Hand-rolled OIDC authorization-code flow for a single provider (Pocket ID).
  class Client
    SCOPE = "openid email profile".freeze

    def authorize_url(state:)
      query = URI.encode_www_form(
        response_type: "code",
        client_id: config.client_id,
        redirect_uri: config.redirect_uri,
        scope: SCOPE,
        state: state
      )
      "#{discovery.authorization_endpoint}?#{query}"
    end

    # Exchanges the auth code for an ID token and verifies it, returning the
    # claims we care about.
    def exchange_and_verify(code)
      verify_id_token(exchange_code(code))
    end

    private

    def exchange_code(code)
      response = Faraday.post(
        discovery.token_endpoint,
        URI.encode_www_form(
          grant_type: "authorization_code",
          code: code,
          redirect_uri: config.redirect_uri,
          client_id: config.client_id,
          client_secret: config.client_secret
        ),
        "Content-Type" => "application/x-www-form-urlencoded"
      )
      raise Error, "token exchange failed (#{response.status})" unless response.success?

      JSON.parse(response.body).fetch("id_token")
    end

    def verify_id_token(id_token)
      loader = ->(options) { JwksCache.key_set(discovery.jwks_uri, force: options[:invalidate]) }

      payload, = JWT.decode(
        id_token, nil, true,
        algorithms: ["RS256"],
        jwks: loader,
        iss: config.issuer, verify_iss: true,
        aud: config.client_id, verify_aud: true
      )

      {sub: payload.fetch("sub"), email: payload["email"], name: payload["name"]}
    end

    def discovery
      @discovery ||= Discovery.new(config.issuer)
    end

    def config
      Oidc.config
    end
  end
end
