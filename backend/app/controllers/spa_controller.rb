class SpaController < ApplicationController
  # The SPA shell is public — authentication happens client-side (the React
  # router hits /api/v1/me and redirects to /auth/login on 401).
  skip_authentication

  INDEX = Rails.public_path.join("index.html").freeze

  def index
    if INDEX.exist?
      send_file INDEX, type: "text/html", disposition: "inline"
    else
      # No bundle baked in (e.g. running the API alone in dev). Say so plainly
      # rather than 500ing on a missing file.
      render plain: "Frontend bundle not built. Run `npm run build` and copy frontend/dist into public/.", status: :not_found
    end
  end
end
