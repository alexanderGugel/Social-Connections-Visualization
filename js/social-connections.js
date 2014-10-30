/*
 * twitter-entities.js
 * This function converts a tweet with "entity" metadata
 * from plain text to linkified HTML.
 *
 * See the documentation here: http://dev.twitter.com/pages/tweet_entities
 * Basically, add ?include_entities=true to your timeline call
 *
 * Copyright 2010, Wade Simmons
 * Licensed under the MIT license
 * http://wades.im/mons
 *
 * Requires jQuery
 */

function escapeHTML(text) {
    return $('<div/>').text(text).html()
}

function linkify_entities(tweet) {
    if (!(tweet.entities)) {
        return escapeHTML(tweet.text)
    }

    // This is very naive, should find a better way to parse this
    var index_map = {}

    $.each(tweet.entities.urls, function(i,entry) {
        index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a href='"+escapeHTML(entry.url)+"'>"+escapeHTML(text)+"</a>"}]
    })

    $.each(tweet.entities.hashtags, function(i,entry) {
        index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a href='http://twitter.com/search?q="+escape("#"+entry.text)+"'>"+escapeHTML(text)+"</a>"}]
    })

    $.each(tweet.entities.user_mentions, function(i,entry) {
        index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a title='"+escapeHTML(entry.name)+"' href='http://twitter.com/"+escapeHTML(entry.screen_name)+"'>"+escapeHTML(text)+"</a>"}]
    })

    var result = ""
    var last_i = 0
    var i = 0

    // iterate through the string looking for matches in the index_map
    for (i=0; i < tweet.text.length; ++i) {
        var ind = index_map[i]
        if (ind) {
            var end = ind[0]
            var func = ind[1]
            if (i > last_i) {
                result += escapeHTML(tweet.text.substring(last_i, i))
            }
            result += func(tweet.text.substring(i, end))
            i = end - 1
            last_i = end
        }
    }

    if (i > last_i) {
        result += escapeHTML(tweet.text.substring(last_i, i))
    }

    return result
}


var colorClasses = ['blue', 'brown', 'red', 'green'];

var randomColorClass = function () {
  return colorClasses[Math.floor(Math.random()*colorClasses.length)];
};

var $overlay = $('#social-connections-popup-overlay');

var showOverlay = function () {
  $overlay.fadeIn();
};

var hideOverlay = function () {
  $overlay.fadeOut();
};

$overlay.click(function () {
  hideOverlay();
});

var tweetPopup = function (tweet) {
  showOverlay();

  var $popup = $('<section />');

  return $popup;
};

var renderAuthor = function (author) {
  return $(
    '<div class="author">' +
      '<a href="' + author.url + '">' +
        '<img src="' + author.image + '">' +
      '</a>' +
      '<div>' +
        '<a href="' + author.url + '">@' + author.username + '</a>' +
        '<span class="location">' + author.location + '</span>' +
      '</div>' +
    '</div>'
  );
};

var tweetTo$tile = function (tweet) {
  var $tile = $('<section />');
  $tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 tile').addClass(randomColorClass());

  var $content = $('<div />').addClass('content').html(linkify_entities(tweet));
  $tile.append($content);

  if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
    $content.empty().addClass('image').css({
      background: 'url(' + tweet.entities.media[0].media_url + ')'
    });
    $content.click(function () {
      showOverlay();
    });
  }

  $tile.append(renderAuthor({
    url: 'http://twitter.com/' + tweet.user.screen_name,
    image: tweet.user.profile_image_url,
    username: tweet.user.screen_name,
    location: tweet.user.location
  }));

  return $tile;
};

var instagramTo$tile = function (data) {
  var $tile = $('<section />');
  $tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 tile').addClass(randomColorClass());

  var $content = $('<div />').addClass('content');
  $tile.append($content);

  $content.addClass('image').css({
    backgroundImage: 'url(' + data.data.images.standard_resolution.url + ')'
  });

  $content.click(function () {
    showOverlay();
  });

  $tile.append(renderAuthor({
    url: 'http://instagram.com/' + data.data.user.username,
    image: data.data.user.profile_picture,
    username: data.data.user.username,
    location: (data.data.location|| '')
  }));

  return $tile;
};

var vineTo$tile = function (data) {
  var vine = data.data.records[0];

  var $tile = $('<section />');
  $tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 tile').addClass(randomColorClass());

  var $content = $('<div />').addClass('content');
  $tile.append($content);

  $content.addClass('image').css({
    backgroundImage: 'url(' + vine.thumbnailUrl + ')'
  });

  var $icon = $('<i class="icon ion-play"></i>');

  $tile.append($icon);

  $icon.click(function () {
    showOverlay();
  });

  $tile.append(renderAuthor({
    url: 'http://vine.co/' + vine.vanityUrls[0],
    image: vine.avatarUrl,
    username: vine.username,
    location: ''
  }));

  return $tile;
};

$(function () {
  var socialConnectionsEl = $('#social-connections');
  var socialConnections = window.socialConnections;

  var socialConnection$tiles = [];

  for (var i = 0; i < socialConnections.twitter.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/twitter/statuses/' + socialConnections.twitter[i], function (data) {
      socialConnectionsEl.append(tweetTo$tile(data));
    });
  }

  for (var i = 0; i < socialConnections.instagram.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/instagram/media/' + socialConnections.instagram[i], function (data) {
      socialConnectionsEl.append(instagramTo$tile(data));
    });
  }

  for (var i = 0; i < socialConnections.vine.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/vine/posts/' + socialConnections.vine[i], function (data) {
      socialConnectionsEl.append(vineTo$tile(data));
    });
  }
});
