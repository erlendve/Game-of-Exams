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
      console.log('konamicode alpha, superhack login as admin 1337 mode');
      if (!Meteor.user()) {
        Meteor.loginWithPassword('Administrator', '123456789');
      }
    }
  }

  konami.load()
}


////////// Accounts UI settings //////////

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});







/////// Global handlebars helpers ///////

// This is not used, and can be deleted
Handlebars.registerHelper('ifeach', function(cursor, options) {
  var ret = "";
  if (cursor.count() !== 0) {

    cursor.forEach( function(exam) {
      ret += options.fn(exam);
    });
    return ret;
  } else {
    return options.inverse();
  }
});

Handlebars.registerHelper('exams', function(){
  return Exams.find({courseId: this._id});
});

Handlebars.registerHelper('courses', function(){
  return Courses.find();
});

//TODO make the exercises return only the exercises for a specific course
Handlebars.registerHelper('exercises', function(){
  console.log(this._id);
  return Exercises.find({set_id: this._id});
});

//TODO this is a temporary solution
Handlebars.registerHelper('isAdmin', function() { 
  return isAdmin();
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
    "exam/:exam_id":                               "exam",
    "admin":                                       "admin", 
    "admin/:exam_id":                              "editExam"
  },

  examlist: function () {
   console.log('routing to examlist');
   Session.set('currentPage', 'examlist');
 },

 admin: function () {
  console.log('routing to admin');
  Session.set('currentPage', 'admin');
  Session.set('currentAdmin', undefined);
},

editExam: function(exam_id) {
  console.log('routing to admin, exam: ' + exam_id);
  Session.set('currentPage', 'admin');
  Session.set('adminContext', exam_id);
},

exam: function(exam_id) {
 console.log('Routing to exam with id: ' + exam_id);
 Session.set('currentPage', 'exam');
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
