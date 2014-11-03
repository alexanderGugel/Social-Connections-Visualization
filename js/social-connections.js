(function () {
  'use strict';

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
  var $popup = $('#social-connections-popup');

  var hideOverlay = function (event) {
    $overlay.fadeOut();
    var $video = $popup.find('video')[0];
    $video && $video.pause();

    $popup.empty();
  };

  $popup.on('click', '.close', hideOverlay);

  var beautifyDate = function (date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return month[date.getMonth()] + ' ' + (date.getDay()+1);
  };


  var renderAuthor = function (author) {
    return $(
      '<div class="author">' +
        '<a href="' + author.url + '" class="avatar-container">' +
          '<img src="' + author.image + '">' +
        '</a>' +
        '<div>' +
          '<a href="' + author.url + '">@' + author.username + '</a>' +
          '<span class="location">' + author.location + '</span>' +
        '</div>' +
      '</div>'
    );
  };

  var tweetOnClick = function (tweet) {
    return function () {
      $overlay.fadeIn();

      var $main = $('<main />');
      $main.addClass(randomColorClass());

      $main.append('<span class="close">✖</span>');
      $main.append('<img src="' + tweet.entities.media[0].media_url + '">');
      $main.append(tweetToAuthor(tweet));
      $main.append('<p>' + linkify_entities(tweet) + '</p>');
      $main.append('<div class="date">' + beautifyDate(tweet.created_at) + '</div>');

      $popup.empty().append($main).fadeIn();
    };
  };

  var tweetToAuthor = function (tweet) {
    return renderAuthor({
      url: 'http://twitter.com/' + tweet.user.screen_name,
      image: tweet.user.profile_image_url,
      username: tweet.user.screen_name,
      location: tweet.user.location
    });
  };

  var tweetToTile = function (tweet) {
    var $tile = $('<section />');
    $tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 tile').addClass(randomColorClass());

    var $content = $('<div />').addClass('content').html(linkify_entities(tweet));
    $tile.append($content);

    if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
      $content.empty().addClass('image').css({
        background: 'url(' + tweet.entities.media[0].media_url + ')'
      });
      $content.click(tweetOnClick(tweet));
    }

    $tile.append(tweetToAuthor(tweet));

    return $tile;
  };

  var instagramToAuthor = function (data) {
    return renderAuthor({
      url: 'http://instagram.com/' + data.data.user.username,
      image: data.data.user.profile_picture,
      username: data.data.user.username,
      location: (data.data.location|| '')
    });
  };

  var instagramOnClick = function (data) {
    return function () {
      $overlay.fadeIn();

      var $main = $('<main />');
      $main.addClass(randomColorClass());

      $main.append('<span class="close">✖</span>');
      $main.append('<img src="' + data.data.images.standard_resolution.url + '">');
      $main.append(instagramToAuthor(data));
      $main.append('<p>' + $('<div />').text(data.data.caption.text).html() + '</p>');
      $main.append('<div class="date">' + beautifyDate(new Date(data.data.created_time*1000)) + '</div>');

      $popup.empty().append($main).fadeIn();
    };
  };

  var instagramToTile = function (data) {
    var $tile = $('<section />');
    $tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 tile').addClass(randomColorClass());

    var $content = $('<div />').addClass('content');
    $tile.append($content);

    $content.addClass('image').css({
      backgroundImage: 'url(' + data.data.images.standard_resolution.url + ')'
    });

    $content.click(instagramOnClick(data));

    $tile.append(instagramToAuthor(data));

    return $tile;
  };

  var vineToAuthor = function (vine) {
    return renderAuthor({
      url: 'http://vine.co/' + vine.vanityUrls[0],
      image: vine.avatarUrl,
      username: vine.username,
      location: ''
    });
  };

  var vineOnClick = function (vine) {
    return function () {
      $overlay.fadeIn();

      var $main = $('<main />');
      $main.addClass(randomColorClass())

      $main.append('<span class="close">✖</span>');

      $main.append(
        '<video controls><source src="' +
        vine.videoUrl +
        '" type="video/mp4"></video>'
      );

      $main.append(vineToAuthor(vine));
      $main.append('<p>' + $('<div />').text(vine.description).html() + '</p>');
      $main.append('<div class="date">' + beautifyDate(vine.created) + '</div>');

      $popup.empty().append($main).fadeIn();

      $main.find('video')[0].play();
    };
  };

  var vineToTile = function (data) {
    var vine = data.data.records[0];

    var $tile = $('<section />');
    $tile.addClass('tile').addClass(randomColorClass());

    var $content = $('<div />').addClass('content');
    $tile.append($content);

    $content.addClass('image').css({
      backgroundImage: 'url(' + vine.thumbnailUrl + ')'
    });

    var $icon = $('<i class="icon ion-play"></i>');

    $tile.append($icon);

    $icon.click(vineOnClick(vine));

    $tile.append(vineToAuthor(vine));

    return $tile;
  };

  var randomElement = function (array) {
    return array[Math.floor(Math.random()*array.length)];
  };

  $(function () {
    var $socialConnectionsEl = $('#social-connections');
    var socialConnections = window.socialConnections;

    var $containers = [];

    for (var i = 0; i < 6; i++) {
      var $container = $('<div />').addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6 container')  ;
      $containers.push($container);
      $socialConnectionsEl.append($container);
    }

    var $tiles = [];

    var addTile = function ($tile) {
      for (var i = 0; i < $containers.length; i++) {
        if (!$containers[i][0].hasChildNodes()) {
          $containers[i].append($tile);
          return;
        }
      }
      $tiles.push($tile);
    };

    for (var i = 0; i < socialConnections.twitter.length; i++) {
      $.get('http://api-stuff.azurewebsites.net/api/twitter/statuses/' + socialConnections.twitter[i], function (data) {
        addTile(tweetToTile(data));
      });
    }

    for (var i = 0; i < socialConnections.instagram.length; i++) {
      $.get('http://api-stuff.azurewebsites.net/api/instagram/media/' + socialConnections.instagram[i], function (data) {
        addTile(instagramToTile(data));
      });
    }

    for (var i = 0; i < socialConnections.vine.length; i++) {
      $.get('http://api-stuff.azurewebsites.net/api/vine/posts/' + socialConnections.vine[i], function (data) {
        addTile(vineToTile(data));
      });
    }

    setInterval(function () {
      var $container = randomElement($containers);
      var $tile = $container.find('.tile');

      var $newTile = randomElement($tiles);

      $tiles.splice($tiles.indexOf($newTile), 1);

      $tile.removeClass('flip in').addClass('flip out').hide();
      $tile.detach();

      $tiles.push($tile);

      $container.append($newTile);
      $newTile.hide();
      $newTile.removeClass('flip out').addClass('flip in').show();
    }, Math.round(Math.random()*5000));
  });
}).call(this);
