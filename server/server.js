Accounts.onCreateUser(function(options, user) {
	if (user.username === 'Administrator')
		user.isAdmin = true;
	else
		user.isAdmin = false;
	
	return user;
});

Accounts.validateNewUser(function (user) {
	console.log(user);
  	return user.username !== "Administrator";
});

////////// Publish rules //////////



///////// Server helper methods ////////
Meteor.methods({
	isAdmin: function () {
		return Meteor.user().isAdmin;
	}
});