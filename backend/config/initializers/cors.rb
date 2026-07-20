# Same-origin in production (Rails serves the JS bundle). In development the
# Vite dev server runs on a different port, so we open CORS for it explicitly.
# Credentials are allowed so cookie-based sessions can ride along once auth
# lands (see zzz-felipe/AUTH_DESIGN.md).

if Rails.env.development?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins "http://localhost:5173"

      resource "*",
        headers: :any,
        credentials: true,
        methods: [:get, :post, :put, :delete, :options, :head]
    end
  end
end
