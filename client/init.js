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


//Get drafts
/*
Deps.autorun(function() {
	if (Meteor.userId()) {
		//Meteor.subscribe("gotDrafts", ["74dd08a8-2d4b-4fc7-9de6-a890fdffa22c", "84a9a6d8-52d7-4f5e-9b57-dad3ef5f62ad"]);
	}
});
*/


//////// Basic meteor Client startup code ////////

////////// Accounts UI settings //////////
Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
});