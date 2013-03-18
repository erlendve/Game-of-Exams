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
				Answers.update({_id: answerId}, {$set : {'result': that.submissionResult, status: 'uploading code', 'loading': false}}, function(error) {
					if (error) {
						console.log('could not update answer ' + answerId + ', error when updating answer');
					} else{
						if (runTests && that.submissionResult.result == 15) {
							var index = that.submissionResult.output.indexOf(runTests);
							if (index < 0)
								return;

							var testOutput = that.submissionResult.output.substring(index);
							if (that.parseResult(testOutput)) {
								var ans = Answers.findOne(answerId);
								var existingSolution = Solutions.findOne({exerciseId: ans.exercise_id, userId: ans.userId});
								if (!existingSolution) {
									Solutions.insert({userId: ans.userId, exerciseId: ans.exercise_id, code: ans.answertext, createdAt: + (new Date)});
									//Players.insert({_id: ans.userId, points: ans.points, exercises_done: 1});
									Players.update(ans.userId, {$inc: {points: ans.points, exercises_done: 1}, $set: {lastChanged: + (new Date)}});
								} else {
									//TODO what happens when exercise is already solved?
									console.log('Solution already saved');
								}
							}
						}
					}						
				});
			}
		}

		this.parseResult = function(testOutput) {
			return testOutput.indexOf('FAILED') < 0;
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
			var mySub = new NewSubmission('erlendlv', 'gameofexams', source, lang, input, answerId, runTests);
		}
	});
});