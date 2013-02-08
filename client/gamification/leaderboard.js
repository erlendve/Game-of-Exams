Template.leaderboard.rendered = function() {
  if ($(window.location.hash).offset()) {
    //TODO remove error being printed in console
    $('html, body').stop().animate({
      'scrollTop': $(window.location.hash).prev().offset().top
    }, 500, 'swing');
  }
};

// Meteor.users.find().forEach(function(user){Players.insert({userId: user._id, username: user.username, points: 0, exercises_done: 0, achievements_done: 0});})  
// Answers.find().forEach(function(ans) {Players.update({userId: ans.userId},{$inc: {points: ans.points, exercises_done: 1}})});

Template.leaderboard.playerPoints = function() {
  var players = Players.find({}, {sort: {points: -1}});
  var counter = 1;
  var rankedArr = [];
  players.forEach(function(player) {
    player['rank'] = counter++;
    if (Meteor.userId() === player['userId'])
      player['me'] = true;
    else
      player['me'] = false;
    
    rankedArr.push(player);
  });
  return rankedArr;
};