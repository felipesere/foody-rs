namespace :foody do
  desc "Bootstrap the first Group + User: " \
       "bin/rails foody:bootstrap GROUP='Sere Family' EMAIL=felipe@example.com NAME=Felipe"
  task bootstrap: :environment do
    group_name = ENV.fetch("GROUP")
    email = ENV.fetch("EMAIL")
    name = ENV.fetch("NAME")

    group = Group.find_or_create_by!(name: group_name)
    user = User.find_or_create_by!(email: email) do |u|
      u.name = name
      u.group = group
    end

    puts "Bootstrapped group=#{group.name.inspect} user=#{user.email.inspect}"
  end
end
