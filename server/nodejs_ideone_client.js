Meteor.startup(function() {

	var require = __meteor_bootstrap__.require;
	var path = require('path');
	var base = path.resolve('.');
	var isBundle = path.existsSync(base + '/bundle');
	var modulePath = base + (isBundle ? '/bundle/static' : '/public') + '/node_modules';

	var rpc = require(modulePath + '/jsonrpc');

	var JsonRpcWrapper = function(){
		this.client = rpc.getClient(80, 'ideone.com');
		this.path = '/api/1/service.json';
		this.call = function(method, params, callback){
			this.client.call(method, params, callback, null, this.path);
		}
	}


	// ideone client
	var ideone = new JsonRpcWrapper();


	// test
	// ideone.call('testFunction', [user, pass], function(error, result) {
	// 	console.log('ideone.com testFunction: ' + result['error']);
	// });

	//helper method to set languages in Language collection
	var languagesResult = null;
	var updateLanguagesCollection =  function() {
		if (languagesResult)
			Languages.insert({'ideone_lang': languagesResult});
		else
			Meteor.setTimeout(updateLanguagesCollection, 1000);
	};

	//set languages in the Language collection
	if (!languagesResult) {
		if (Languages.find().count() === 0) {
			ideone.call('getLanguages', ['gameofexams', 'ba5ag7rU'], function(error, result) {
				if (error) {
					throw new Meteor.Error(520, 'Could not get languages from ideone.com', error);
				}		
				if (result) {
					languagesResult = result.languages;
				}
			});
			updateLanguagesCollection();
		}
	}

	function NewSubmission(user, pass, source, lang, input, answerId, runTests) {
		var that = this;
		this.link = '';
		this.source = source;
		this.lang = lang;
		this.input = input;
		this.user = user;
		this.pass = pass;
		this.submissionResult = null;
		this.status = -1;
		this.timeoutCounter = 0;

		this.updateAnswer = function() {
			that.timeoutCounter = that.timeoutCounter+1;
			var statustext = 'done - the program has finished';
			if (!that.submissionResult) {
				if (that.status < 0) {
					statustext = 'waiting for compilation - the paste awaits compilation in the queue';
				} else if (that.status == 1) {
					statustext = 'compilation - the program is being compiled';
				} else if (that.status == 3) {
					statustext = 'running - the program is being executed';
				} else {
					statustext = "There was an error when executing your program at ideone.com"
				}
				
				if  (that.timeoutCounter < 20) {
					Answers.update({_id: answerId}, {$set : {status: statustext, 'loading': true}}, function() {});
					Meteor.setTimeout(that.updateAnswer, 1000);
				} else {
					Answers.update({_id: answerId}, {$set : {status: 'Could not connect to ideone.com. Try to resubmit answer in a few seconds', 'loading': true}}, function() {});
				}
			} else {
				if (runTests && that.submissionResult.result == 15) {
					var index = that.submissionResult.output.indexOf(runTests);
					if (index >= 0) {

						var testOutput = that.submissionResult.output.substring(index);

						var ans = Answers.findOne(answerId);
						////////////   Special case for Oblig4: ////////////
						if (ans.exercise_id === "b3ee729a-dbd2-4a38-a629-0c0410de9d50") {
							console.log('Oblig4 for sho!');
							var existingSolution = Solutions.findOne({exerciseId: ans.exercise_id, userId: ans.userId});

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
							if (!existingSolution) {
								Solutions.insert({userId: ans.userId, exerciseId: ans.exercise_id, code: ans.answertext, points: pts, createdAt: + (new Date), visibility: 'private'});
								Players.update(ans.userId, {$inc: {points: pts, exercises_done: 1}, $set: {lastChanged: + (new Date)}});
							} else {
								if (existingSolution['points'] < pts) {
									var diff = pts - existingSolution['points'];
									Solutions.update(existingSolution._id, {$set: {code: ans.answertext, points: pts, createdAt: + (new Date)}});
									Players.update(ans.userId, {$inc: {points: diff}, $set: {lastChanged: + (new Date)}});
								}
							}

							that.submissionResult.output = that.submissionResult.output.replace(new RegExp(runTests + "\n", "g"), "");
							Answers.update({_id: answerId}, {$set : {'result': that.submissionResult, status: 'uploading code', 'loading': false}}, function(error) {});
							return;
						}
						////////// End oblig 4 special case ///////

						if (that.parseResult(testOutput)) {
							var existingSolution = Solutions.findOne({exerciseId: ans.exercise_id, userId: ans.userId});

							if (!existingSolution) {
								Solutions.insert({userId: ans.userId, exerciseId: ans.exercise_id, code: ans.answertext, createdAt: + (new Date), visibility: 'public'});
								Players.update(ans.userId, {$inc: {points: ans.points, exercises_done: 1}, $set: {lastChanged: + (new Date)}});
							} else {
								//TODO what happens when exercise is already solved?
								console.log('Solution already saved');
							}
						}
						that.submissionResult.output = that.submissionResult.output.replace(new RegExp(runTests + "\n", "g"), "");
					}
				}
				Answers.update({_id: answerId}, {$set : {'result': that.submissionResult, status: 'uploading code', 'loading': false}}, function(error) {});
			}
		}

		this.parseResult = function(testOutput) {
			return testOutput.indexOf('FAILED') < 0 && testOutput.indexOf('SKIPPED') < 0;
		}

		this.wait = function(){
			ideone.call('getSubmissionStatus', [that.user, that.pass, that.link], function(error, result){
				if(result['status'] != 0){
					that.status = result['status'];
					setTimeout(that.wait, 1000);
				} else {
					that.details();
				}
			});
		};

		this.details = function(){
			ideone.call('getSubmissionDetails', [that.user, that.pass, that.link, false, false, true, true, true], function(error, result){
				if (result) {
					console.log(result);
					that.submissionResult = result;
				} else {
					console.log('ERROR getting SubmissionDetails at ideone.com:');
					console.log(error);
				}
			});
		}

		//This creates the submission, and sends it to ideone.com
		ideone.call('createSubmission', [that.user, that.pass, that.source, that.lang, that.input, true, true], function(error, result){
			if(result['error'] == 'OK'){
				that.link = result['link'];
				console.log('link: http://ideone.com/' + that.link);
				that.wait();
			} else {
				console.log(result['error']);
			}
		});

		that.updateAnswer();
	};

	Meteor.methods({
		submitAndEvaluate: function(source, answerId, lang, input, runTests) {
			console.log('submit reached nodejs client');
			var mySub = new NewSubmission('erlendlv', 'gameofexams', source, lang, input, answerId, runTests);
		}
	});
});