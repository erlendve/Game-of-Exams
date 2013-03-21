//////////  Subscriptions go here ////////
Deps.autorun(function() {
	Meteor.subscribe("courses");
});

Deps.autorun(function() {
	Meteor.subscribe("exercises");
});

Deps.autorun(function() {
	Meteor.subscribe("exams");
});

Deps.autorun(function() {
	Meteor.subscribe("answers");
});

Deps.autorun(function() {
	Meteor.subscribe("players");
});

Deps.autorun(function() {
	Meteor.subscribe("languages");
});

Deps.autorun(function() {
	Meteor.subscribe("solutions");
});

Deps.autorun(function() {
	Meteor.subscribe("adminSubscription");
});

//////// Basic meteor.startup code ////////

////////// Accounts UI settings //////////
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});