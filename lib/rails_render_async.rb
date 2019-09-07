require "rails_render_async/view_helper"
require "rails_render_async/engine" if defined? Rails
require "rails_render_async/configuration"

ActionView::Base.send :include, RailsRenderAsync::ViewHelper if defined? ActionView::Base

module RailsRenderAsync
  class << self
    attr_accessor :configuration
  end

  def self.configuration
    @configuration ||= RailsRenderAsync::Configuration.new
  end

  def self.reset
    @configuration = RailsRenderAsync::Configuration.new
  end

  def self.configure
    yield(configuration)
  end
end
