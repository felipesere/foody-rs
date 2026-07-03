# Idempotent seed data for local development. Creates a default group and a
# couple of users with no oidc_subject yet (stamped on first real login).
group = Group.find_or_create_by!(name: "Sere Family")

[
  { email: "felipe@example.com", name: "Felipe" },
  { email: "charlotte@example.com", name: "Charlotte" },
].each do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |user|
    user.name = attrs[:name]
    user.group = group
  end
end
