require "fileutils"
require "json"

module FixtureWriter
  ROOT = Rails.root.join("..", "frontend", "test-fixtures", "api", "v1").expand_path

  def self.assert_or_write(name, body)
    path = ROOT.join("#{name}.json")
    pretty = JSON.pretty_generate(JSON.parse(body)) + "\n"

    if ENV["UPDATE_FIXTURES"] == "1"
      FileUtils.mkdir_p(path.dirname)
      File.write(path, pretty)
      return
    end

    unless path.exist?
      raise "Fixture missing: #{path}\nRun with UPDATE_FIXTURES=1 to create it."
    end

    return if File.read(path) == pretty

    raise "Fixture mismatch: #{path}\n" \
          "Run with UPDATE_FIXTURES=1 to regenerate, then check the diff."
  end
end
