module UserAttributed
  extend ActiveSupport::Concern

  class MissingCurrentUser < StandardError; end

  included do
    belongs_to :created_by, class_name: "User"
    belongs_to :updated_by, class_name: "User"

    before_validation :attribute_to_current_user
  end

  private

  # Every write happens on behalf of a signed-in user (require_login guarantees
  # it in requests). created_by is set once; updated_by tracks the latest editor.
  def attribute_to_current_user
    user = Current.user
    raise MissingCurrentUser, "#{self.class.name} written without a Current.user" unless user

    self.created_by ||= user
    self.updated_by = user
  end
end
