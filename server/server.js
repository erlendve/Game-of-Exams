Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	}
	Players.insert({
		_id: user._id, 
		achievements_done: 0,
		exercises_done: 0,
		lastChanged: + (new Date),
		points: 0,
		username: user.username});
	return user;
});

// Accounts.validateNewUser(function (user) {
// 	// TODO remove this hack
// 	if (Meteor.users.find().count() === 0)
// 		return true;
// 	return user.username !== "Administrator";
// });

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
				'createdAt': +(new Date),
				'saved': false,
				'result': null,
				'loading': true
			}, function (error, result) {
				if (error)
					return false;
				if (result) {
					var exercise = Exercises.findOne(exerciseId);
					var combined = "";
					if (exercise) {
						if (exercise.before)
							combined = combined + exercise.before;
						
						combined = combined + source;
						
						if (exercise.after)
							combined = combined + "\n" + exercise.after;
						
						if (exercise.tests && runTests) {
							var rid = Random.id();
							exercise.tests = exercise.tests.replace(/_GOE_TESTS_ID/g, rid);
							combined = combined + "\n" +exercise.tests;
							runTests = rid;
						}
						
					} else {
						combined = source;
					}
					console.log('create new answer');
					var res = Meteor.call('submitAndEvaluate', combined, result, lang, input, runTests, function() {});
				}
			});
} else {
			//exerciseId is actually the id of the answer
			console.log('submitting answer from server');
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
						
						combined = combined + source;
						
						if (exercise.after)
							combined = combined + "\n" + exercise.after;
						
						if (exercise.tests && runTests) {
							var rid = Random.id();
							exercise.tests = exercise.tests.replace(/_GOE_TESTS_ID/g, rid);
							combined = combined + "\n" +exercise.tests;
							runTests = rid;
						}
						
					} else {
						combined = source;
					}
					console.log('update existing answer');
					Meteor.call('submitAndEvaluate', combined, exerciseId, lang, input, runTests, function() {});
				}
			});
			return answerId;
		}
	}
});

// larseop@ulrik.uio.no

Meteor.startup(function() {
	/*if (!Solutions.findOne({visibility: 'public'})) {
		Solutions.update({}, {$set: {visibility: 'public'}}, {multi: true});
		Solutions.update({exercise_id: "b3ee729a-dbd2-4a38-a629-0c0410de9d50"}, {$set: {visibility: 'private'}}, {multi: true});
	}*/
	//Exercises.update("b3ee729a-dbd2-4a38-a629-0c0410de9d50", {$set: {visibility: 'private'}});

	/*var moo = function () {Players.remove({}); return function() {};};
	moo = moo();
	if (Players.find().count() === 0) {
		Solutions.remove({});
		Meteor.users.find().forEach(function(user){
			if (!Players.findOne(user._id))
				Players.insert({_id: user._id, username: user.username, points: 0, exercises_done: 0, achievements_done: 0, lastChanged: user.createdAt});
		});
		var i=0;
		Answers.find({exercise_id: "b3ee729a-dbd2-4a38-a629-0c0410de9d50"}).forEach(function(ans) {
			var index = ans.result.output.indexOf('*** Test Collection ***');
			var testOutput = ans.result.output.substring(index);
			if (index >= 0 && testOutput.indexOf('FAILED') < 0 && testOutput.indexOf('SKIPPED') < 0) {
				i++;
				console.log('\n' + Meteor.users.findOne(ans.userId).username + ' solved the exercise with output:\n ' + testOutput.substring(0, 58));
				if (!Solutions.findOne({exerciseId: ans.exercise_id, userId: ans.userId})) {
					Solutions.insert({userId: ans.userId, exerciseId: ans.exercise_id, code: ans.answertext, createdAt: ans.createdAt});
					Players.update(ans.userId, {$inc: {points: ans.points, exercises_done: 1}, $set: {lastChanged: ans.createdAt}});
				}
			} else {
				var pts = 0;
				pts = testOutput.indexOf('** Testname: leggInn og inneholder - PASSED') > 0 ? pts + 15: pts;


				pts = testOutput.indexOf('** Testname: leggInn og hent paa nokkel - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: leggInn() og hent(int nr) paa indeks - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: leggInn() og antall() - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: hentMinste() - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: hentStorste() - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: fjernElement() - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: fjernAlle() - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: tilArray - PASSED') > 0 ? pts + 15: pts;
				pts = testOutput.indexOf('** Testname: iterator() hasNext() og next() - PASSED') > 0 ? pts + 25: pts;
				pts = testOutput.indexOf('** Testname: iterate and remove() with iterator - PASSED') > 0 ? pts + 25: pts;
				pts = testOutput.indexOf('** Testname: ingen duplikate noekler - PASSED') > 0 ? pts + 15: pts;
				console.log('Solved Oblig4 with ' + pts + ' points');


				Solutions.insert({userId: ans.userId, exerciseId: ans.exercise_id, code: ans.answertext, points: pts, createdAt: ans.createdAt});
				Players.update(ans.userId, {$inc: {points: pts}, $set: {lastChanged: ans.createdAt}});
			}
		});
}*/
});