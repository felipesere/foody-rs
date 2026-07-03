require "webmock/rspec"

# Allow in-process rack-test requests (localhost) but block real external HTTP;
# OIDC provider calls are stubbed per-example.
WebMock.disable_net_connect!(allow_localhost: true)
