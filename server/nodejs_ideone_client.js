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
	// var user = 'gameofexams';
	// var pass = 'ba5ag7rU';

	// ideone client
	var ideone = new JsonRpcWrapper();

	// test
	// ideone.call('testFunction', [user, pass], function(error, result) {
	// 	console.log('ideone.com testFunction: ' + result['error']);
	// });

	function NewSubmission(user, pass, source, lang, input, answerId) {
		var that = this;
		this.link = '';
		this.source = source;
		this.lang = lang;
		this.input = input;
		this.user = user;
		this.pass = pass;
		this.submissionResult = null;


		this.updateAnswer = function() {
			if (!that.submissionResult) {
				Meteor.setTimeout(that.updateAnswer, 1000);
			} else {
				Answers.update({_id: answerId}, {$set : {'result': that.submissionResult}});
			}
		}
		
		this.wait = function(){
			ideone.call('getSubmissionStatus', [that.user, that.pass, that.link], function(error, result){
				console.log(result);
				if(result['status'] != 0){
					setTimeout(that.wait, 1000);
				} else {
					that.details();
				}
			});
		};

		this.details = function(){
			ideone.call('getSubmissionDetails', [that.user, that.pass, that.link, false, false, true, true, true], function(error, result){
				console.log(result);
				that.submissionResult = result;
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
		submitAndEvaluate: function(source, answerId, lang, input) {
			var mySub = new NewSubmission('gameofexams', 'ba5ag7rU', source, lang, input, answerId);
		}
	});
});