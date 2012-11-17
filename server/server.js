if (Meteor.users.findOne({username: 'Administrator'})) {
	console.log('Admin exists');
} else {
	console.log('Admin does not exist, creating account');
	Accounts.createUser({username: 'Administrator', password: '123456789', isAdmin: true});
}

Accounts.onCreateUser(function(options, user) {
	if (user.username === 'Administrator')
		user.isAdmin = true;
	else
		user.isAdmin = false;
	return user;
});

////////// Publish rules //////////



///////// Server helper methods ////////
Meteor.methods({
	isAdmin: function () {
		console.log('AM I ADMIN??? ' + Meteor.user().isAdmin);
		return Meteor.user().isAdmin;
	}
});