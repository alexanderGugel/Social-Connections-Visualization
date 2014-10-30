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
  var tile = $('<section />');
  tile.addClass('pure-u-1-1 pure-u-sm-1-2 pure-u-md-1-6').addClass(randomColorClass());

  tile.append(
    '<div class="author">' +
      '<img src="' + tweet.user.profile_image_url + '">' +
      '<div>' +
        '<a href="#">@jennyh</a>' +
        '<span class="location">Colorado Springs, CO</span>' +
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
