Accounts.onCreateUser(function(options, user) {
	if (user.username === 'Administrator')
		user.isAdmin = true;
	else
		user.isAdmin = false;
	
	return user;
});

Accounts.validateNewUser(function (user) {
	//TODO remove this hack
	if (Meteor.users.find().count() === 0)
		return true;
	return user.username !== "Administrator";
});

///////// Server startup code ////////
Meteor.startup(function() {
});


///////// Server helper methods ////////
Meteor.methods({
	isAdmin: function () {
		return Meteor.user().isAdmin;
	}, 
	'submitAnswer': function(source, setId, exerciseId) {
		if (!this.userId)
			throw new Meteor.Error(403, 'You must be logged in');

		if (!Exams.findOne(setId))
			throw new Meteor.Error(400, 'The exercise set does not exist', setId + ' does not exist in the database');

		var exercise = Exercises.findOne(exerciseId);
		if (! exercise)
			throw new Meteor.Error(400, 'The exercise does not exist', exerciseId + ' does not exist in the database');

		//TODO fix so lang get's code from exercise.lang and some table info
		var lang = 55;
		var input = exercise.input;
		
		//find lang from exercise, and evaluate true/false, and points
		//Insert answer to database
		var answerId = Answers.insert({
			'userId': this.userId,
			'set_id': setId,
			'exercise_id': exerciseId,
			'answertext': source,
			'points': exercise.points,
			'pointsAtSave': 0,
			'createdAt': +(new Date),
			'saved': false,
			'result': null,
			'error': null
		}, function (error, result) {	
			if (error)
				return false;
			if (result) {
				var res = Meteor.call('submitAndEvaluate', source, result, lang, input, function(error, result) {
					if (error) {
						console.log(error)
					}
					if (result) {
						console.log(result)
					}
				});
			}
		});

		return answerId;
	},
	'saveAnswer': function(answerId, exerciseId, multiplier) { //TODO change mulitplier stuff
		console.log(exerciseId);
		var exercise = Exercises.findOne(exerciseId);
		var ans = Answers.findOne(answerId);
		var retval = false;
		var p = 0;
		if (exercise.eval) {
			var correct = exercise.eval.trim();
			var ansres = ans.result.output.trim();
			console.log('eval:');
			console.log(exercise.eval);
			console.log('res:');
			console.log(ans.result.output);


			console.log(ansres.localeCompare(correct));
			if (ansres.localeCompare(correct) === 0) {
				retval = true;
				p =Math.round( exercise.points * multiplier * 10 ) / 10;
			}
		}
		Answers.update(answerId, {$set: {saved: true, pointsAtSave: p}},
			function(error, result) {
				console.log(error)
				console.log(result)
			}
			);
		return retval;
	}
});