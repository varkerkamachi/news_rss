class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.string :identifier
      t.string :title
      t.text :summary
      t.datetime :story_date
      t.string :source
      t.boolean :favorite, default: false

      t.timestamps
    end
  end
end
