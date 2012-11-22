			// $('textarea').autosize();

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
		console.log(i);
		return i;
	}
});

Template.player.events({
	'submit': function(e) {
		e.preventDefault();
		var values = $('#form_answer' + this._id).serializeArray();
		var answertext = values[0].value;
		console.log('answering ' + this.title + ' with ' + answertext);
		if (!Meteor.userId()) {
			alert('Please wait... and try again in a few seconds');
			return false;
		}
		//TODO do this better so it does an insert if update fails
		if (Answers.find({userId: Meteor.userId(), exercise_id: this._id}).count() > 0) {
			Answers.update({'userId': Meteor.userId(), 'exercise_id': this._id}, {$set : {'answertext': answertext}});
		} else {
			Answers.insert({'userId': Meteor.userId(), 'exercise_id': this._id, 'answertext': answertext, 'points': this.points});
			notifyStandard(this.points + ' points awarded', 'Congratulations! You got ' + this.points+ ' points for answering <strong>' + this.title + '</strong>', 'success', 'icon-thumbs-up');
		}
		return false;
	}
});

Template.player.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});
}

Template.exercise_main.helpers({
	'answer': function() {
		var answer = Answers.findOne({userId: Meteor.userId(), exercise_id: this._id});
		if (answer) {
			return answer.answertext;
		} else {
			return false;
		}
	} 
});