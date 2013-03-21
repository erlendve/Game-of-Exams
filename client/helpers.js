/////// Global handlebars helpers ///////
// Handlebars.registerHelper('markdown', function (options) {
//   var converter = new Showdown.converter();
//   return converter.makeHtml(options.fn(this));
// });


Handlebars.registerHelper('md', function (options) {
  var converter = new Showdown.converter();
  var res = '';
  var html =converter.makeHtml(options.fn(this));
  // var high = hljs.highlightAuto(html).value;
  // res += high;
  return res;
});

Handlebars.registerHelper('exams', function(){
  return Exams.find({courseId: this._id});
});

Handlebars.registerHelper('courses', function(){
  return Courses.find();
});

Handlebars.registerHelper('findExercise', function(){
  return Exercises.findOne({_id: this.exercise_id})
});

//TODO this is a temporary solution
Handlebars.registerHelper('isAdmin', function() { 
  return isAdmin();
});

Handlebars.registerHelper('myPoints', function() {
  var p = Players.findOne(Meteor.userId());
  return p ? p.points: 0;
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

Handlebars.registerHelper('ifwith', function(conditional, options) {
  if(conditional) {
    return options.fn(conditional);
  } else {
    return options.inverse(this);
  }
});

// HELPER: #key_value
//
// Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
//
// Iterate over an object, setting 'key' and 'value' for each property in
// the object.
Handlebars.registerHelper("key_value", function(obj, fn) {
  var buffer = "",
  key;
  
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      buffer += fn({key: key, value: obj[key]});
    }
  }
  
  return buffer;
});

// HELPER: #each_with_key
//
// Usage: {{#each_with_key container key="myKey"}}...{{/each_with_key}}
//
// Iterate over an object containing other objects. Each
// inner object will be used in turn, with an added key ("myKey")
// set to the value of the inner object's key in the container.
Handlebars.registerHelper("each_with_key", function(obj, fn) {
  var context,
  buffer = "",
  key,
  keyName = fn.hash.key;
  
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      context = obj[key];
      
      if (keyName) {
        context[keyName] = key;
      }
      
      buffer += fn(context);
    }
  }
  
  return buffer;
});

Handlebars.registerHelper('supportedLanguages', function (fn) {
  var ideone = Languages.findOne();
  if (ideone) {
    return fn.fn({all: ideone.ideone_lang});
  }
  else
    return fn.fn({all: {55: 'ERROR: Reload page'}})
});

Handlebars.registerHelper('getUsername', function(userId) {
  var res = Meteor.users.findOne(userId);
  if (res) {
    return res.username;
  } else{
    return 'Deleted user';
  };
});

Handlebars.registerHelper('formatTimestamp', function(timestamp) {
  return moment(timestamp).calendar();
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
