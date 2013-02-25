////////// Simple backbone router //////////

var GoeRouter = Backbone.Router.extend({
  initialize: function() {
    var self = this;
    // window.onhashchange = function (e) {
    //   self.scrollToSection(location.hash, -95, true);
    //   return false;
    // };
  },

  scrollToSection: function (section, offset, ignore) {
    $.waypoints('disable')

    // Session.set("section", section.substr(1));
    $('.active').removeClass('active');
    $('#li_'+ section.substr(1)).addClass('active');
    $("html, body").stop().animate({
      scrollTop: $(section).offset().top + offset
    }, 500, 'swing', function () {
      $.waypoints('enable');
    });
  },
  routes: {
    "":                                            "examlist",
    "main":                                        "examlist",
    "courses":                                     "examlist",
    "exam/:exam_id":                               "exam",
    "admin":                                       "admin", 
    "admin/:id":                                   "editSet",
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

  editSet: function(id) {
    Session.set('currentPage', 'admin');
    Session.set('subpage', id);
    Session.set('currentExercise', null);
    Session.set('currentTab', null);
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
    Session.set('currentPage', 'profile');
    Session.set('subpage', username);
  }
});

var Router = new GoeRouter;

Meteor.startup(function () {
  Backbone.history.start({pushState: true});

  //when 
  // window.onhashchange = function () {
  //   scrollToSection(location.hash);
  // };

  // var scrollToSection = function (section) {
  //   console.log('scrolling yo');
  //   ignore_waypoints = true;
  //   // console.log(section);
  //   Session.set("section", section.substr(1));
  //   scroller().animate({
  //     scrollTop: $(section).offset().top - 95
  //   }, 500, 'swing', function () {
  //     // window.location.hash = section;
  //     ignore_waypoints = false;
  //   });
  // };
});

Template.page.displayPage = function() {
  var page = Session.get('currentPage');

  if (Template[page]) {
    return Template[page]();
  } else {
    return Template['page_not_found']();
  }
}