require "rails_helper"

RSpec.describe "Auth::Sessions (OIDC)", type: :request do
  let(:issuer) { "https://pocket.example.test" }
  let(:client_id) { "foody" }
  let(:rsa) { OpenSSL::PKey::RSA.generate(2048) }
  let(:jwk) { JWT::JWK.new(rsa) }

  before do
    config = Rails.application.config.oidc
    config.issuer = issuer
    config.client_id = client_id
    config.client_secret = "shhh"
    config.redirect_uri = "http://localhost:3000/auth/callback"
    Oidc::JwksCache.reset!

    stub_request(:get, "#{issuer}/.well-known/openid-configuration").to_return(
      status: 200,
      headers: {"Content-Type" => "application/json"},
      body: {
        issuer: issuer,
        authorization_endpoint: "#{issuer}/authorize",
        token_endpoint: "#{issuer}/token",
        jwks_uri: "#{issuer}/jwks",
        end_session_endpoint: "#{issuer}/logout"
      }.to_json
    )
    stub_request(:get, "#{issuer}/jwks").to_return(
      status: 200,
      headers: {"Content-Type" => "application/json"},
      body: {keys: [jwk.export]}.to_json
    )
  end

  def id_token(sub:, email:, key: rsa, aud: client_id, iss: issuer, kid: jwk.kid)
    JWT.encode(
      {
        sub: sub, email: email, name: "Someone",
        aud: aud, iss: iss,
        iat: Time.now.to_i, exp: 1.hour.from_now.to_i
      },
      key, "RS256", {kid: kid}
    )
  end

  def stub_token(token)
    stub_request(:post, "#{issuer}/token").to_return(
      status: 200,
      headers: {"Content-Type" => "application/json"},
      body: {id_token: token, token_type: "Bearer"}.to_json
    )
  end

  # Hits /auth/login (setting the signed state cookie) and returns the state it
  # handed to the provider, so the callback can echo it back.
  def start_login
    get "/auth/login"
    Rack::Utils.parse_query(URI(response.headers["Location"]).query).fetch("state")
  end

  describe "GET /auth/login" do
    it "redirects to the provider with a state parameter" do
      get "/auth/login"
      expect(response).to have_http_status(:found)
      expect(response.headers["Location"]).to start_with("#{issuer}/authorize?")
      expect(response.headers["Location"]).to include("client_id=foody")
    end
  end

  describe "GET /auth/callback" do
    it "logs in a user whose oidc_subject already matches" do
      user = create(:user, oidc_subject: "sub-123")
      stub_token(id_token(sub: "sub-123", email: user.email))

      state = start_login
      get "/auth/callback", params: {code: "abc", state: state}

      expect(response).to redirect_to("/")
      expect(user.sessions.count).to eq(1)
    end

    it "bootstraps a pre-provisioned user by email and stamps the subject" do
      user = create(:user, email: "charlotte@example.com", oidc_subject: nil)
      stub_token(id_token(sub: "fresh-sub", email: "charlotte@example.com"))

      state = start_login
      get "/auth/callback", params: {code: "abc", state: state}

      expect(response).to redirect_to("/")
      expect(user.reload.oidc_subject).to eq("fresh-sub")
    end

    it "rejects an unknown email with 403" do
      stub_token(id_token(sub: "who", email: "stranger@example.com"))

      state = start_login
      get "/auth/callback", params: {code: "abc", state: state}

      expect(response).to have_http_status(:forbidden)
    end

    it "rejects a mismatched state with 400" do
      start_login
      get "/auth/callback", params: {code: "abc", state: "not-the-state"}

      expect(response).to have_http_status(:bad_request)
    end

    it "rejects an ID token signed with an unknown key with 401" do
      other_key = OpenSSL::PKey::RSA.generate(2048)
      stub_token(id_token(sub: "s", email: "x@example.com", key: other_key))

      state = start_login
      get "/auth/callback", params: {code: "abc", state: state}

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /auth/session" do
    it "destroys the current session" do
      # The global before signed in the default user via /dev/login.
      expect { delete "/auth/session" }.to change(Session, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
