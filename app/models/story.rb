require 'json'

class Story < ActiveRecord::Base

  URL='https://www.reddit.com/r/news.json'

  scope :most_recent, -> (num) { order('created_at desc').limit(num) }
  scope :by_favorite, -> (num) { order('favorite desc').limit(num) }
  scope :favorites,   -> { where('favorite = ?', true) }

  class << self
    def connect_to_resource url=''
      url = URL if url.blank?
      # using feedjira gem
      @conn = Faraday.get(url)
    end

    def store_new_records data
      return false if data.blank?
      data.each{|story| puts "story: #{story.inspect }..........."; Story.create(title: story.try(:title), summary: story.try(:url))}
    end
    # update for a 'heartbeat'
    # amqp connection ...

    # pull the stories from reddit news
    def fetch_stories
      self.connect_to_resource if @conn.blank?
      json = self.parse_data JSON.parse(@conn.try(:body)) || {}
    end

    def fetch_story_ids
      Story.all.map(&:identifier)
    end

    # iterates over returned string, converting to json and discarding unwanted key/val pairs
    def parse_data data
      @json_data = {} # hash for slightly faster lookup
      data['data']['children'].each_with_index do |d, idx|
        @json_data[idx] = d['data'].try(:symbolize_keys)
        break if idx > 18 # limit to 20
      end
      # only keep records which aren't in the database
      @json_data.delete_if{|k,v| v[:id].present? && fetch_story_ids.include?(v[:id]) }
      # # then store these newer ones in the db
      @json_data.each{|k,v| v.keep_if{|prop| [:id, :title, :domain, :url, :created].include? prop } }.each{|record| self.store_record(record.last)}
    end

    # write to db
    # {:url=>"http://,,,,", :title=>"blahblah}
    def store_record data={}
      return false if data.blank?
      title = data[:title].try(:length) > 250 ? data[:title].slice(0, 250) : data[:title]
      Story.create(
        identifier: data[:id],
        title: title,
        summary: data[:url],
        story_date: Time.at(data[:created]),
        source: data[:domain]
        ) rescue nil
    end
  end
end
