# Copied from rails_render_async gem, no shame!
require 'securerandom'

module RailsRenderAsync
  module ViewHelper
    def render_async_cache_key(path)
      "render_async_#{path}"
    end

    def render_async_cache(path, options = {}, &placeholder)
      cached_view = Rails.cache.read("views/#{render_async_cache_key(path)}")

      if cached_view.present?
        render :html => cached_view.html_safe
      else
        render_async(path, options, &placeholder)
      end
    end

    def render_async(path, options = {}, &placeholder)
      container_id = options.delete(:container_id) || generate_container_id
      container_class = options.delete(:container_class)
      event_name = options.delete(:event_name)
      placeholder = capture(&placeholder) if block_given?
      method = options.delete(:method) || 'GET'
      error_message = options.delete(:error_message)
      retry_count = options.delete(:retry_count) || 0
      lazy_load = options.delete(:lazy_load) || false
      interval = options.delete(:interval) || 0
      html_element_name = options.delete(:html_element_name) || 'div'

      render 'rails_render_async/render_async',
             html_element_name: html_element_name,
             container_id: container_id,
             container_class: container_class,
             path: path,
             event_name: event_name,
             placeholder: placeholder,
             method_name: method,
             error_message: error_message,
             retry_count: retry_count,
             lazy_load: lazy_load,
             interval: interval
    end

    private

    def generate_container_id
      "render_async_#{SecureRandom.hex(5)}#{Time.now.to_i}"
    end
  end
end
