module GroupScoped
  extend ActiveSupport::Concern

  included do
    belongs_to :group
    before_validation :assign_group_from_current, on: :create
  end

  private

  # Denormalised group ownership: stamp the current group on create so both
  # top-level and nested records carry it (see AUTH_DESIGN.md). Reads scope
  # explicitly through `Current.group.*` in the controllers.
  def assign_group_from_current
    self.group ||= Current.group
  end
end
