//////////  Subscriptions go here ////////
Deps.autorun(function() {
	Meteor.subscribe("exercises");
});

Deps.autorun(function() {
	Meteor.subscribe("exams");
});

Deps.autorun(function() {
	Meteor.subscribe("courses");
});

Deps.autorun(function() {
	Meteor.subscribe("answers");
});

Meteor.subscribe("players");

Meteor.subscribe("languages");

Meteor.subscribe("solutions");

//////// Basic meteor.startup code ////////

////////// Accounts UI settings //////////
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});