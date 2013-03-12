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
	'submitAnswer': function(source, setId, exerciseId, exists, runTests) {
		if (!this.userId)
			throw new Meteor.Error(403, 'You must be logged in');

		if (!Exams.findOne(setId))
			throw new Meteor.Error(400, 'The exercise set does not exist', setId + ' does not exist in the database');

		if (!exists) {
			var exercise = Exercises.findOne(exerciseId);
			if (! exercise)
				throw new Meteor.Error(400, 'The exercise does not exist', exerciseId + ' does not exist in the database');
		}
		//TODO fix so lang get's code from exercise.lang and some table info
		var lang = 55;
		var input = "";
		
		//find lang from exercise, and evaluate true/false, and points
		//Insert answer to database

		if (!exists) {
			answerId = Answers.insert({
				'userId': this.userId,
				'set_id': setId,
				'exercise_id': exerciseId,
				'answertext': source,
				'points': exercise.points,
				'pointsAtSave': 0,
				'createdAt': +(new Date),
				'saved': false,
				'result': null,
				'error': null,
				'loading': true
			}, function (error, result) {
				if (error)
					return false;
				if (result) {
					var exercise = Exercises.findOne(exerciseId);
					var combined = "";
					if (exercise) {
						if (exercise.tests && runTests)
							combined = combined + exercise.tests;

						if (exercise.before)
							combined = combined + exercise.before;
						
						combined = combined + source;
					}
					console.log('create new answer');
					var res = Meteor.call('submitAndEvaluate', combined, result, lang, input);
				}
			});
		} else {
			//exerciseId is actually the id of the answer
			answerId = Answers.update(exerciseId, {$set: {answertext: source, loading: true}}, function (error, result) {
				if (error) {
					console.log('update failed');
					return new Meteor.Error(500, "Database did not accept updated answer");
				} else {
					var exercise = Exercises.findOne(Answers.findOne(exerciseId).exercise_id);
					var combined = "";
					if (exercise) {
						if (exercise.before)
							combined = combined + exercise.before;
						
						combined = combined + "\n" + source;
						
						if (exercise.after)
							combined = combined + "\n" + exercise.after;
						
						if (exercise.tests && runTests)
							combined = combined + "\n" +exercise.tests;

						
					} else {
						combined = source;
					}
					console.log('update existing answer');
					Meteor.call('submitAndEvaluate', combined, exerciseId, lang, input);
				}
			});
			return answerId;
		}
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