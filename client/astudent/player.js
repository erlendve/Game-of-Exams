Template.player.helpers({
	'currentExam': function() {
		var exam_id = Session.get('subpage');

		if (exam_id) {
			return Exams.findOne(exam_id);
		} else 
		return false;
	},
	'examTotalPoints': function() {
		var i = 0;
		Exercises.find({set_id: this._id}).forEach( function(exam) {
			i += exam.points;
		});
		return i;
	}, 

	'examCurrentPoints': function() {
		var i = 0;
		Answers.find({userId: Meteor.userId(), set_id: this._id}).forEach( function(ans) {
			if (ans.saved)
				i += ans.pointsAtSave;
		});
		return i;
	},
	'exercises': function () {
		return Exercises.find({set_id: this._id}, {sort: {number: 1}});
	}
});

Template.player.events({
	'submit': function(e) {
		e.preventDefault();
		var form = $('#form_answer' + this._id);
		var values = form.serializeArray();
		var answertext = values[0].value;
		// var count = Answers.find().count() + 1;

		var user = Meteor.user();
		if (!user) {
			alert('Please wait... and try again in a few seconds');
			return false;
		}
		//TODO implement this when publishing Players collection?
		if (!Players.findOne({userId: user._id})) {
			Players.insert({userId: user._id, username: user.username, points: 0, exercises_done: 0, achievements_done: 0});
		}
		//TODO do this better so it does an insert if update fails
		if (Answers.find({userId: Meteor.userId(), exercise_id: this._id}).count() > 0) {
			Answers.update({'userId': Meteor.userId(), 'exercise_id': this._id}, {$set : {'answertext': answertext, 'edited': moment().format()}});
			// Players.update({userId: Meteor.userId()},{$inc: {points: ans.points, exercises_done: 1}});
		} else {
			// Answers.insert({'userId': Meteor.userId(), 'set_id': this.set_id, 'exercise_id': this._id, 'answertext': answertext, 'points': this.points, 'created': moment().format()});
			// Players.update({userId: Meteor.userId()},{$inc: {points: this.points, exercises_done: 1}});
			// Players.update({userId: Meteor.userId()}, {$set: {achievements: null, achievements_done: 0}});
			// notifyStandard(this.points + ' points awarded', 'Congratulations! You got ' + this.points+ ' points for answering <strong>' + this.title + '</strong>', 'success', 'icon-thumbs-up');
			Meteor.call('submitAnswer', answertext, this.set_id, this._id, 
				function(error, result) {
					// console.log('result:' + result);
				});
		}
		return false;
	}
});

Template.player.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});
	// $('.bs-docs-sidebar').scrollspy();
	$('.bs-docs-sidenav').affix({offset: {top: $('header').outerHeight()}})

	$('textarea').each(function (i, el) {
		var $el,
		$container,
		editor;

		$el = $(el);

		//
        // Principle: inject an DOM element (sized and positioned) and hide the textarea
        //

        $container = $('<div/>').css({
        	position: 'relative',
        	width: $el.width(),
        	height: $el.height(),
        	border: "1px solid gray"
        }).insertAfter(el);

        $el.hide();

        //
		// ACE magic
		//

		editor = ace.edit($container[0]);

		editor.setTheme("ace/theme/chaos");
		editor.getSession().setMode("ace/mode/java");
		// Keep hidden textarea in sync

		editor.getSession().setValue($el.val());
		editor.getSession().on('change', function () {
			$el.val(editor.getSession().getValue());
		}); 
	});
}

///////// Exercise_main ////////
Template.exercise_main.helpers({
	'answer': function() {
		var answer = Answers.findOne({userId: Meteor.userId(), exercise_id: this._id});
		if (answer) {
			return answer;
		} else {
			return false;
		}
	},
	'isRight': function() {
		var answer = Answers.findOne({userId: Meteor.userId(), exercise_id: this._id});
		if (answer.pointsAtSave === 0)
			return false;
		else
			return true;
	},
	'processResult': function() {
		var res = this.result;
		if (res) {
			//Change this to give pretty html
			switch(res.result)
			{
				case 11:
				return {type: 'Compilation error', out: res.cmpinfo, label: 'important'} //hljs.highlight('java', res.cmpinfo).value
				break;
				case 12:
				return {type: 'Runtime error', out: res.stderr, label: 'important'} //hljs.highlight('java', res.stderr).value
				break;
				case 13:
				return {type: 'Time limit exceeded', out: 'The program used more than 15 seconds to execute. Usually this indicates an eternal loop in the program.', label: ''}
				break;
				case 15:
				return {type: 'Success - everything went ok', out: res.output, label: 'success'}
				break;
				case 17:
				return {type: 'Memory limit exceeded', out: 'The program tried to use more memory than it is allowed. Memory used:' + res.memory, label: ''}
				break;
				case 19:
				return {type: 'Illegal system call', out: 'The program tried to call an illegal system call', label: 'inverse'}
				break;
				case 20:
				return {type: 'Internal error', out: 'some problem occured on ideone.com. Try to submit the program again and if that fails contact the site administrator', label: 'inverse'}
				break;
				default:
				return {type: 'Error', out: 'Unkown error', label: 'inverse'}
			}
		}
		else
			return false;
	}
});

Template.exercise_main.events({
	'click #btn_remove_answer': function(e) {
		e.preventDefault();
		Answers.remove(this._id);
		Players.update({userId: Meteor.userId()},{$inc: {points: -this.points, exercises_done: -1}});
		Players.update({userId: Meteor.userId()}, {$set: {achievements: null, achievements_done: 0}});
		notifyStandard(this.pointsAtSave + ' points removed', 'You deleted an answer on exercise <strong>' + Exercises.findOne(this.exercise_id).title + '</strong>', 'error', 'icon-trash');
	},
	'click #btn_edit_answer': function(e) {
		e.preventDefault();
		console.log('edit answer');

	},
	'click #btn_save_answer': function(e) {
		e.preventDefault();
		var that = this;
		//TODO fix hacky multiplier
		Meteor.call('saveAnswer', this._id, this.exercise_id, 1.0,
			function(error, result) {
				if (result) {
					console.log(result);
					var p = Math.round( that.points * 1.0 * 10 ) / 10;
					notifyStandard(p + ' points awarded', 'Congratulations! You got ' + p + ' points for answering <strong>' + Exercises.findOne(that.exercise_id).title + '</strong>', 'success', 'icon-thumbs-up');
				} else {
					var p = 0;
					console.log(error);
					notifyStandard(p + ' points awarded', 'Aww snap! Expected output is ' + Exercises.findOne(that.exercise_id).eval + '<br />You got: '+ that.result.output +  '</strong>', 'error', 'icon-thumbs-down');
				}
			});
	}
});