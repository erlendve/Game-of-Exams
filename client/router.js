////////// Simple backbone router //////////

var GoeRouter = Backbone.Router.extend({
  routes: {
    "":                                            "examlist",
    "main":                                        "examlist",
    "courses":                                     "examlist",
    "exam":                                        "exam",
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
    Session.set('editingSet', null);
  },

  editSet: function(id) {
    Session.set('currentPage', 'admin');
    Session.set('editingSet', null);
    Session.set('subpage', id);
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
});

Template.page.displayPage = function() {
  var page = Session.get('currentPage');
  $('body').attr('data-spy', 'scroll');
  // $('.bs-docs-sidebar').scrollspy();
  // $('body').attr('data-target', '.bs-docs-sidebar');


  if (Template[page]) {

    //Some specific scripts that need to be added after window/document has loadeds
    if (page === 'player' || 'admin') {
        // Ace integration
        (function() {
          window.require(["ace/ace"], function(a) {
            a && a.config.init();
            if (!window.ace)
              window.ace = {};
            for (var key in a) if (a.hasOwnProperty(key))
              ace[key] = a[key];
          });
        })();
      }

      return Template[page]();
    } else {
      return Template['page_not_found']();
    }
  }