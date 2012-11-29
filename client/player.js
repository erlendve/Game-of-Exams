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
			i += ans.points;
		});
		return i;
	}
});

Template.player.events({
	'submit': function(e) {
		e.preventDefault();
		var form = $('#form_answer' + this._id);
		var values = form.serializeArray();
		var answertext = values[0].value;
		var count = Answers.find().count() + 1;

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
			Answers.insert({'userId': Meteor.userId(), 'set_id': this.set_id, 'exercise_id': this._id, 'answertext': answertext, 'points': this.points, 'created': moment().format()});
			Players.update({userId: Meteor.userId()},{$inc: {points: this.points, exercises_done: 1}});
			notifyStandard(this.points + ' points awarded', 'Congratulations! You got ' + this.points+ ' points for answering <strong>' + this.title + '</strong>', 'success', 'icon-thumbs-up');
		}
		return false;
	}
});

Template.player.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});

	//tab functionality in textarea
	$("textarea").keydown(function(e) {
    	if(e.keyCode === 9) { // tab was pressed
       		// get caret position/selection
       		var start = this.selectionStart;
       		var end = this.selectionEnd;

       		var $this = $(this);
       		var value = $this.val();

        	// set textarea value to: text before caret + tab + text after caret
        	$this.val(value.substring(0, start)
        		+ "\t"
        		+ value.substring(end));

        	// put caret at right position again (add one for the tab)
        	this.selectionStart = this.selectionEnd = start + 1;

        	// prevent the focus lose
        	e.preventDefault();
        }
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
});

Template.exercise_main.events({
	'click #btn_remove_answer': function(e) {
		e.preventDefault();
		Answers.remove(this._id);
		Players.update({userId: Meteor.userId()},{$inc: {points: -this.points, exercises_done: -1}});
		notifyStandard(this.points + ' points removed', 'You deleted an answer on exercise <strong>' + Exercises.findOne(this.exercise_id).title + '</strong>', 'error', 'icon-trash');
	},
	'click #btn_edit_answer': function(e) {
		e.preventDefault();
		console.log('edit answer');
	}
});