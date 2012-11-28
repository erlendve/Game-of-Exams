Accounts.onCreateUser(function(options, user) {
	if (user.username === 'Administrator')
		user.isAdmin = true;
	else
		user.isAdmin = false;
	return user;

	Players.insert({userId: user._id, username: user.username, exercises_done: 0, achievements_done: 0, points: 0});
});

////////// Publish rules //////////



///////// Server helper methods ////////
Meteor.methods({
	isAdmin: function () {
		return Meteor.user().isAdmin;
	}
});