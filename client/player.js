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

Template.player.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});
}