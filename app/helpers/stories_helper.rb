module StoriesHelper
  def generate_story_title_and_link data
    link_to truncate( data.title.try(:titleize), length: 90 ), data.try(:summary), class: 'title_link', target: '_blank'
  end

  # prints the source website
  def print_source data
    content_tag(:span, class: 'source', title: 'Story source') do
      data.try(:source)
    end
  end

  # puts a star which is interactive - user can save story as a favorite...
  def render_favorite_stars data
    css = data.try(:favorite) == true ? 'star favorite left' : 'star left'
    content_tag(:span, class: css, title: 'Click to save as a favorite') do
      "select to save as a favorite"
    end
  end
end
