module Oidc
  # In-memory cache of the provider's JWKS. Refreshes on a TTL, and again on a
  # `kid` miss (the jwt gem calls the loader with invalidate: true), so key
  # rotation is picked up without a restart.
  class JwksCache
    TTL = 10.minutes
    MUTEX = Mutex.new

    class << self
      def key_set(jwks_uri, force: false)
        MUTEX.synchronize do
          if force || stale?
            @keys = fetch(jwks_uri)
            @fetched_at = Time.current
          end
          @keys
        end
      end

      def reset!
        MUTEX.synchronize do
          @keys = nil
          @fetched_at = nil
        end
      end

      private

      def stale?
        @keys.nil? || @fetched_at.nil? || (Time.current - @fetched_at) > TTL
      end

      def fetch(jwks_uri)
        response = Faraday.get(jwks_uri)
        raise Error, "JWKS fetch failed (#{response.status})" unless response.success?

        { keys: JSON.parse(response.body).fetch("keys") }
      end
    end
  end
end
