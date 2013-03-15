Template.focusExercise.exercise =  function () {
	return Exercises.findOne("691a59cc-a815-4fb2-83ed-5fd5b94f1e9a");
}

Template.focusExercise.rendered = function() {
	// var ans = Answers.findOne({exercise_id: "691a59cc-a815-4fb2-83ed-5fd5b94f1e9a"});
	// console.log(ans);
	// if (ans) {
	// 	var editor = ace.edit('staticeditor');
	// 	editor.setValue(ans['answertext']);
	// 	editor.focus();
	// 	editor.gotoLine(editor.session.getLength()+1);
	// 	editor.setTheme("ace/theme/monokai");
	// 	editor.getSession().setMode("ace/mode/java");
	// 	editor.getSession().on('change', function () {
	// 		$('#area').val(editor.getSession().getValue());
	// 	}); 
	// }
	// console.log('rendered');
}

Template.staticAnswer.answer = function() {
	return Answers.findOne("qmHaRCNNBfANL3fdq");
}

Template.staticAnswer.events({
	'click button': function() {
		Meteor.call('submitAnswer', "class TestMania", "d06a3fa0-352d-492d-8378-5629c2f7f046", "qmHaRCNNBfANL3fdq", true, false);
	}
});