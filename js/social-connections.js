// var socialConnections = window.socialConnections;
//
// for (var i = 0; i < socialConnections.twitter.length; i++) {
//   $.getJSON('http://api.instagram.com/oembed?url=' + socialConnections.twitter[i], function (data) {
//     socialConnections.instagram[i] = data;
//   });
// }

var colorClasses = ['blue', 'brown', 'red', 'green'];

var randomColorClass = function () {
  return colorClasses[Math.floor(Math.random()*colorClasses.length)];
};

var tweetToTile = function (tweet) {
  console.log(tweet);
  var tile = $('<section />');
  tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6').addClass(randomColorClass());

  var content = $('<div />').addClass('content');
  content.text(tweet.text);
  tile.append(content);

  if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
    tile.css({
      background: 'url(' + tweet.entities.media[0].media_url + ')'
    });
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


$(function () {
  var socialConnectionsEl = $('#social-connections');
  var socialConnections = window.socialConnections;

  var socialConnectionTiles = [];

  for (var i = 0; i < socialConnections.twitter.length; i++) {
    $.get('http://api-stuff.azurewebsites.net/api/twitter/statuses/' + socialConnections.twitter[i], function (data) {
      socialConnectionsEl.append(tweetToTile(data));
    });
  }
});
