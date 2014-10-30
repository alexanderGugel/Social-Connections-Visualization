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

var tweetToTile = function (tweet) {
  var tile = $('<section />');
  tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6').addClass(randomColorClass());

  var content = $('<div />').addClass('content').html(linkify_entities(tweet));
  tile.append(content);

  if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
    tile.css({
      background: 'url(' + tweet.entities.media[0].media_url + ')'
    });
    content.empty();
  }

  tile.append(
    '<div class="author">' +
      '<a href="http://twitter.com/' + tweet.user.screen_name + '">' +
        '<img src="' + tweet.user.profile_image_url + '">' +
      '</a>' +
      '<div>' +
        '<a href="http://twitter.com/' + tweet.user.screen_name + '">@' + tweet.user.screen_name + '</a>' +
        '<span class="location">' + tweet.user.location + '</span>' +
      '</div>' +
    '</div>'
  );

  return tile;
};

var instagramToTile = function (data) {
  console.log(data);
  var tile = $('<section />');
  tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6').addClass(randomColorClass());

  var content = $('<div />').addClass('content');
  tile.append(content);

  tile.css({
    backgroundImage: 'url(' + data.data.images.standard_resolution.url + ')'
  });

  tile.append(
    '<div class="author">' +
      '<a href="http://instagram.com/' + data.data.user.username + '">' +
        '<img src="' + data.data.user.profile_picture + '">' +
      '</a>' +
      '<div>' +
        '<a href="http://instagram.com/' + data.data.user.username + '">@' + data.data.user.username + '</a>' +
        '<span class="location">' + data.data.location + '</span>' +
      '</div>' +
    '</div>'
  );

  return tile;
};


$(function () {
  var socialConnectionsEl = $('#social-connections');
  var socialConnections = window.socialConnections;

  var socialConnectionTiles = [];

  for (var i = 0; i < socialConnections.twitter.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/twitter/statuses/' + socialConnections.twitter[i], function (data) {
      socialConnectionsEl.append(tweetToTile(data));
    });
  }

  for (var i = 0; i < socialConnections.instagram.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/instagram/media/' + socialConnections.instagram[i], function (data) {
      socialConnectionsEl.append(instagramToTile(data));
    });
  }


});
