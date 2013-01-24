// ['100_ex_60_px_trans.png', '15_ex_60_px_trans.png', '50_ex_60_px_trans.png', 'all_the_code_ask_trans.png', 'all_the_code_trans.png', 'first_60_px_trans.png', 'python_1_60_px_trans.png', 'python_2_60_px_trans.png', 'python_3_60_px_trans.png']
// ['100_ex_60_px.png', '15_ex_60_px.png', '50_ex_60_px.png', 'all_the_code.png', 'all_the_code_ask.png', 'first_60_px.png', 'python_1_60_px.png', 'python_2_60_px.png', 'python_3_60_px.png']
Template.profile.achievements = function() {
  var user = Meteor.users.findOne({username: Session.get('subpage')});
  var trans = {'15points': '15_ex_60_px_trans.png','50points': '50_ex_60_px_trans.png','corporate': 'all_the_code_ask_trans.png','all_the_code': 'all_the_code_trans.png','one_exam': 'python_1_60_px_trans.png','two_exam': 'python_2_60_px_trans.png','three_exam': 'python_3_60_px_trans.png'};
  var normal = {'100points': '100_ex_60_px.png','15points': '15_ex_60_px.png','50points': '50_ex_60_px.png','all_the_code': 'all_the_code.png','corporate': 'all_the_code_ask.png','first': 'first_60_px.png','one_exam': 'python_1_60_px.png','two_exam': 'python_2_60_px.png','three_exam': 'python_3_60_px.png'};

  var res = trans;
  if (!user) {
    for (key in res) {
      res[key] = {image: trans[key], done: false};
    }
    return res;
  }

  var player = Players.findOne({userId: user._id});
  var ach = player.achievements;
  if (!ach) {
    var curr = []
    if (player.points >= 15)
      curr.push('15points');
    if (player.points >= 50)
      curr.push('50points');
    if (player.points >= 100)
      curr.push('100points');

    var complete_exams = 0;
    var h09 = Exams.findOne({year: '2009'})._id;
    var h10 = Exams.findOne({year: '2010'})._id;
    var h11 = Exams.findOne({year: '2011'})._id;

    if (Answers.find({userId: user, set_id: h09}).count() === 3)
      complete_exams += 1;
    if (Answers.find({userId: user, set_id: h10}).count() === 5)
      complete_exams += 1;
    if (Answers.find({userId: user, set_id: h11}).count() === 5)
      complete_exams += 1;

    console.log(complete_exams);
    if (complete_exams >= 1) {
      curr.push('one_exam');
    }
    if (complete_exams >= 2) {
      curr.push('two_exam');
    }
    if (complete_exams >= 3) {
      curr.push('three_exam');
    }

    if (Answers.findOne({userId: user, exercise_id: "0059de37-0954-4504-ab78-5f0b5a6086eb"}))
      curr.push('corporate');

    if (Answers.find({userId: user}).count() === 13)
      curr.push('all_the_code');

    Players.update({userId: user}, {$set: {achievements: curr, achievements_done: curr.length}});
  }
  ach = player.achievements;

  for (key in res) {
    res[key] = {image: trans[key], done: false};
  }

  for (i in ach) {
    res[ach[i]] = {image: normal[ach[i]], done: true};
  }
  // console.log(ach);
  // console.log(Players.findOne({userId: user}));

  // var reslist = []
  // for (key in res) {
  //   reslist.push(res[key]);
  // }
  return res;
}

Template.profile.getUser = function() {
  var name = Session.get('subpage');
  var user = Players.findOne({username: name});

  if (user) 
    return user;
  else 
    return false;
}

Template.page.events = {
  //This is to prevent browser refresh, so the app does not have to load again.
  'click .goe-navlink': function(event) {
    // prevent default browser link click behaviour
    event.preventDefault();
    // get the path from the link        
    var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
    var pathname = reg.exec(event.currentTarget.href)[1];
    // route the URL 
    Router.navigate(pathname, true);
  }
}

Template.feed.live = function() {
  //sort reverse hack
  return Answers.find({saved: true}, {sort: {$natural:-1}}).fetch().reverse();
}

Template.feed.rendered = function() {
  $('code').each(function(i, e) {hljs.highlightBlock(e)});
};

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

Template.navbar.events({
  //humour?
  'dblclick #alpha': function() {
    konamiactivate();
  }, 

  'click #alpha': function(e) {
    e.preventDefault();
  }
});

//Bullshit konami code
function konamiactivate() {
  konami = new Konami()
  konami.code = function() {
    if (Meteor.user()) {
      alert('Konami code is awesome. One day this alert will be awesome too!');
    }
  }

  konami.load()
}


////////// Accounts UI settings //////////

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
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
  return Exams.find({courseId: this._id}, {sort: {year: -1}});
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
    //TODO fix this hack later
    if (ans.saved)
      res += ans.pointsAtSave;
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
});

Handlebars.registerHelper('my_gravatar', function(size) {
  var email = 'gravatar@gameofexams.com';
  if (Meteor.user()) {
    var emails = Meteor.user().emails;
    if (emails)
      email = emails[0].address;
  }

  return get_gravatar(email, size);
});


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
    "leaderboard/:*":                              "leaderboard",
    "profile/:username":                           "profile",
    "backup":                                      "backup"
  },
  
  examlist: function () {
    Session.set('currentPage', 'examlist');
  },

  admin: function () {
    Session.set('currentPage', 'admin');
    Session.set('subpage', null);
  },

  editExam: function(exam_id) {
    Session.set('currentPage', 'admin');
    Session.set('subpage', exam_id);
  },

  exam: function(exam_id) {
    Session.set('currentPage', 'player');
    if (exam_id) {
      Session.set('subpage', exam_id);
    }
  },

  feed: function() {
    Session.set('currentPage', 'feed');
  }, 

  leaderboard: function() {
    Session.set('currentPage', 'leaderboard');
  },

  profile: function(username) {
    Session.set('currentPage', 'profile');''
    Session.set('subpage', username);
  }, 

  backup: function() {
    Session.set('currentPage', 'backup');
  }
});

Router = new GoeRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
  // Meteor.setInterval(function() {Session.set("now", moment().format())}, 1000);
});

///////// Helpers for routing ////////

Handlebars.registerHelper('currentPage', function(page){
  return Session.equals('currentPage', page);
});

Template.page.displayPage = function() {
  var page = Session.get('currentPage');

  // return Template[page]();
  if (Template[page]) {
    return Template[page]();
  } else {
    return Template['page_not_found']();
  }
}