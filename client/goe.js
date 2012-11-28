Template.feed.live = function() {
  //sort reverse hack
  return Answers.find({}, {sort: {$natural:-1}}).fetch().reverse();
}

Template.feed.rendered = function() {
  $('code').each(function(i, e) {hljs.highlightBlock(e)});
};

Template.leaderboard.rendered = function() {
  if ($(window.location.hash).offset()) {
    //TODO remove error being printed in console
    $('html, body').stop().animate({
      'scrollTop': $(window.location.hash).offset().top
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
}

if (Meteor.isClient) {

	Template.navbar.events({
		'click #exams': function() {
			console.log('exams');
		}, 
    //humour?
    'dblclick #alpha': function() {
      konamiactivate();
    }, 
    
    'click #alpha': function(e) {
      e.preventDefault();
    }
  });
}

//Bullshit konami code
function konamiactivate() {
  konami = new Konami()
  konami.code = function() {
    if (!Meteor.user()) {
      alert('Konami code is awesome. One day this alert will be awesome too!');
    }
  }

  konami.load()
}


////////// Accounts UI settings //////////

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});







/////// Global handlebars helpers ///////
Handlebars.registerHelper('markdown', function (options) {
  var converter = new Showdown.converter();
  return converter.makeHtml(options.fn(this));
});


Handlebars.registerHelper('md', function (options) {
  var converter = new Showdown.converter();
  var res = '';
  var html =converter.makeHtml(options.fn(this));
  var high = hljs.highlightAuto(html).value;
  res += high;
  return res;
});

Handlebars.registerHelper('exams', function(){
  return Exams.find({courseId: this._id});
});

Handlebars.registerHelper('courses', function(){
  return Courses.find();
});

//TODO make the exercises return only the exercises for a specific course
Handlebars.registerHelper('exercises', function(){
  return Exercises.find({set_id: this._id});
});

Handlebars.registerHelper('findExercise', function(){
  return Exercises.findOne({_id: this.exercise_id})
});

//TODO this is a temporary solution
Handlebars.registerHelper('isAdmin', function() { 
  return isAdmin();
});

Handlebars.registerHelper('myPoints', function() {
  var res = 0;
  Answers.find({userId: Meteor.userId()}, {fields: {points: 1}}).forEach(function (ans) {
    res += ans.points;
  })
  return res;
});

Handlebars.registerHelper("debug", function(optionalValue) { 
  console.log("Current Context");
  console.log("====================");
  console.log(this);

  if (optionalValue) {
    console.log("Value"); 
    console.log("===================="); 
    console.log(optionalValue); 
  } 
}
);


////////// Javascript helpers ////////
function createAutoClosingAlert(selector, delay) {
  console.log('closing alert' + selector);
  var alert = $(selector).alert();
  window.setTimeout(function() { alert.alert('close') }, delay);
}

//TODO make a better solution than checking for username
function isAdmin() {
  if (Meteor.user() && Meteor.user().username === 'Administrator') {
    return true;
  } else {
    return false;
  }
}




////////// Router //////////

var GoeRouter = Backbone.Router.extend({
  routes: {
    "":                                            "examlist",
    "main":                                        "examlist",
    "courses":                                     "examlist",
    "exam":                                        "exam",
    "exam/:exam_id":                               "exam",
    "admin":                                       "admin", 
    "admin/:exam_id":                              "editExam",
    "feed":                                        "feed",
    "leaderboard/:*":                       "leaderboard"
  },

  examlist: function () {
   // console.log('routing to examlist');
   Session.set('currentPage', 'examlist');
   // Session.set('subpage', undefined);
 },

 admin: function () {
  // console.log('routing to admin');
  Session.set('currentPage', 'admin');
  // Session.set('subpage', undefined);
},

editExam: function(exam_id) {
  // console.log('routing to admin, exam: ' + exam_id);
  Session.set('currentPage', 'admin');
  Session.set('subpage', exam_id);
},

exam: function(exam_id) {
 // console.log('Routing to exam with id: ' + exam_id);
 Session.set('currentPage', 'exam');
 if (exam_id) {
  Session.set('subpage', exam_id);
}
console.log('subpage: ' + Session.get('subpage'));
},

feed: function() {
  Session.set('currentPage', 'feed');
}, 

leaderboard: function() {
  Session.set('currentPage', 'leaderboard');
}
});

Router = new GoeRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});

///////// Helpers for routing ////////

Handlebars.registerHelper('currentPage', function(page){
  return Session.equals('currentPage', page);
});