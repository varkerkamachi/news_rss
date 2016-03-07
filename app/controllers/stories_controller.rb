class StoriesController < ApplicationController
  respond_to :json, :html
  def index
    # fetch headlines from feed
    Story.fetch_stories

    if user_has_favorites?
      @data = Story.by_favorite(20)
    else
      @data = Story.most_recent(20)
    end
end

  def update
    @fs = Story.find_or_create_by(id: params[:story_id])
    @fs.favorite = params[:favorite].to_i == 1 ? true : false
    @fs.save!

    respond_with @fs
  end
end
