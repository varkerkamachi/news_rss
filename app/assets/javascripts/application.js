// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

var refresh=false,
  interval = 30000,
  refreshCount = 0,
  refreshLimit = 20;

$(document).on('click', '.star', function() {
  toggleFavorite.call($(this));
})
.on('mousedown', 'input[type="radio"]', function() {
  console.log('va', $(this)[0].value);
  setRefresh($(this)[0].value);
});

var toggleFavorite = function() {
  if($(this).hasClass('favorite')) {
    favoriteThisStory(0, $(this).parent().attr('id'));
  }
  else {
    favoriteThisStory(1, $(this).parent().attr('id'));
  }
  $(this).toggleClass('favorite');
};

var favoriteThisStory = function(bool, elmId) {
  //create favorite for this story
  var favorite = bool == 1 ? true : false;

  $.ajax(
    '/stories/'+elmId+'/favorites/set/'+bool
  )
  .success(function(responseData) {
    console.log('responseData', responseData);
    renderHtmlForItem(elmId, responseData);
  });

};

var renderHtmlForItem = function(id, data) {
  var style = data['favorite'] == true ? 'star favorite left' : 'star left';
  console.log('style', style);
  $('#'+id+' .star').css(style);
};

var setInterval = function(data) {
  interval = data;
  refreshCycle();
};

var setRefresh = function(data) {
  refresh = data;
  if(refresh == 'true') {
    $('#refresh_interval').attr('disabled', false);
  }
  else {
    $('#refresh_interval').attr('disabled', 'disabled');
  }
};

var refreshCycle = function(){
  console.log('starting  refresh.............', refresh, refreshCount, refreshLimit);
  if( refresh == true && (refreshCount < refreshLimit) ) {
    setTimeout(function(){
      window.location.reload();
    }, interval);
  }
  else {
    setRefresh(false);
    refreshCount = 0;

    return;
  }
};
