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

// after 20 cycles we want the auto-refresh to be disabled so we don't hammer reddit too long
var refreshLimit = 10;


// event handlers for stars and config radio buttons
$(document).on('click', '.star', function() {
  toggleFavorite.call($(this));
})
.on('mousedown', 'input[type="radio"]', function() {
  setRefresh($(this)[0].value);
});

//set config options from local storage...
function init() {
  if(localStorage.getItem("refresh") == undefined){
    localStorage.setItem("refresh", 'false');
  }
  if(localStorage.getItem("interval") == undefined){
    localStorage.setItem("interval", 0);
  }
  if(parseInt(localStorage.getItem("refreshCount")) == NaN){
    localStorage.setItem("refreshCount", 0);
  }
  this.refresh = localStorage.getItem("refresh");
  this.interval = localStorage.getItem("interval");
  this.refreshCount = localStorage.getItem("refreshCount");

  getRefreshIntervalState();
  setRefreshOption();
  refreshCycle();
}

function getRefreshIntervalState() {
  if(this.refresh == 'true') {
    $('#refresh_interval').attr('disabled', false);
    $('#refresh_enabled_false').attr('checked', false);
    $('#refresh_enabled_true').attr('checked', 'true');
  }
  else {
    $('#refresh_interval').attr('disabled', 'disabled');
    $('#refresh_enabled_true').attr('checked', false);
    $('#refresh_enabled_false').attr('checked', 'true');
  }
};

// selected option for refresh option menu
function setRefreshOption(val) {
  if(val == 0) {
    $('#refresh_interval option[value=0]').prop('selected', true);
  }
  else {
    if(this.interval != 'undefined') {
      $('#refresh_interval option[value='+ localStorage.getItem("interval") + ']').prop('selected', true);
    }
  }
}

// css change and ajax handler call to favorite a story
var toggleFavorite = function() {
  if($(this).hasClass('favorite')) {
    favoriteThisStory(0, $(this).parent().attr('id'));
  }
  else {
    favoriteThisStory(1, $(this).parent().attr('id'));
  }
  $(this).toggleClass('favorite');
};

// actual favorite story api call....
var favoriteThisStory = function(bool, elmId) {
  //create favorite for this story
  var favorite = bool == 1 ? true : false;

  $.ajax(
    '/stories/'+elmId+'/favorites/set/'+bool
  )
  .success(function(responseData) {
    renderHtmlForItem(elmId, responseData);
  });

};

// dynamicaally set css for stars
var renderHtmlForItem = function(id, data) {
  var style = data['favorite'] == true ? 'star favorite left' : 'star left';
  $('#'+id+' .star').css(style);
};

var setInterval = function(data) {
  localStorage.setItem("interval", data);
  this.interval = localStorage.getItem("interval");
  refreshCycle.call();
};

var setRefresh = function(data) {
  localStorage.setItem("refresh", data);
  this.refresh = localStorage.getItem("refresh");
  // disable option menu
  if(data == 'false') {
    setRefreshOption(0);
  }
  getRefreshIntervalState();
};

// manage refresh of page ...
var refreshCycle = function(){
  if( this.refresh == 'true' && this.interval > 0) {
    // increment counter ...
    incrementRefreshCount();
    if(parseInt(this.refreshCount) < parseInt(this.refreshLimit)) {//
      return setTimeout(
        function(){
          // requery for new stories & trigger refreshCycle call again
          window.location.reload();
        }, this.interval);
    }
    else {
      return resetRefresh();
    }
  }
  else {
    return resetRefresh();
  }
}

var resetRefresh = function() {
  setRefresh('false');
  this.refreshCount = 0;
  localStorage.setItem('refreshCount', this.refreshCount);
}

var incrementRefreshCount = function() {
  this.refreshCount = parseInt(this.refreshCount) + 1;
  localStorage.setItem('refreshCount', this.refreshCount);
}

$(document).ready(function() {
  init();
});


