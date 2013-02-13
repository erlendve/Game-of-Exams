Template.creator.helpers({
	'currentExercise': function () {
		var setId = Session.get('subpage');
		var curEx = Session.get('currentExercise');
		var ex = Exercises.find({set_id: setId}, {sort: {number: 1}});

		if (ex.count() > 0) {
			// console.log('has ' + ex.count() + ' exercises');

			if (curEx) {
				// console.log('current exercise set to' + curEx);
				return Exercises.findOne(curEx);
			}
			// Session.set('currentExercise', ex.fetch()[0]._id);
			// console.log(ex.fetch()[0]);
			return ex.fetch()[0];
		} else {
			// console.log('has no exercises on set ' + setId);
			return false;
		}
		// var self = this;
		// var cur = Session.get('currentExercise');
		// if (cur) {
		// 	var ex =  Exercises.findOne(cur);
		// 	if (ex.set_id !== this._id) {
		// 		console.log('moo');
		// 		ex = Exercises.find({set_id: this._id}).fetch()[0];
		// 		console.log(ex._id);
		// 		// Session.set('currentExercise', ex._id);
		// 	}
		// 	return ex;
		// } else {
		// 	if (this.exercises) {
		// 		console.log(this.exercises);
		// 		Session.set('currentExercise', this.exercises[0]);
		// 		return false;
		// 	}
		// 	else {
		// 		Exercises.insert({
		// 			set_id: this._id,
		// 			number: 1,
		// 			letter: '',
		// 			text: '',
		// 			title: 'Rename me',
		// 			points: 5,
		// 			createdAt: + (new Date),
		// 			owner: Meteor.userId(),
		// 			lang: this.lang,
		// 			published: false
		// 		}, function(error, result) {
		// 			if (result) {
		// 				Session.set('currentExercise', result);
		// 				Exams.update(self._id, {$set: {exercises: [result]}});
		// 			}
		// 		});
		// 	}
		// }
	},

	'getExercises': function () {
		return Exercises.find({set_id: this.set_id}, {sort: {number: 1}});
	},
	'isActive': function(options) {
		if (Session.get('currentExercise') === this._id)
			return 'class=active';
	}
});

var editArea = function (which, el) {
	var $el,
	$container,
	editor;

	$el = $(el);
	$container = $(which);

    //
	// ACE magic
	//

	editor = ace.edit($container[0]);

	editor.setTheme("ace/theme/chaos");
	editor.getSession().setValue($el.val());

	if(which == '#edit-code-text') {
		editor.getSession().setMode("ace/mode/markdown");
		editor.getSession().on('change', function () {
			// var Showdown = require('showdown');
			var converter = new Showdown.converter();
			var live = converter.makeHtml(editor.getSession().getValue());
			$('#livemarkdown').html(live);
		}); 
	} else {
		//TODO make sure mode sets to language selected
		editor.getSession().setMode("ace/mode/java");
		editor.setTheme("ace/theme/monokai");
	}

	// Keep hidden textarea in sync
	editor.getSession().on('change', function () {
		$el.val(editor.getSession().getValue());
	}); 
};

Template.creator.events({
	'click #code-text': function(e) {
		e.preventDefault();
		$('#code-text').tab('show');
		editArea('#edit-code-text', $('#textarea-code-text'));
	},
	'click #code-before': function(e) {
		e.preventDefault();
		$('#code-before').tab('show');
		editArea('#edit-code-before', $('#textarea-code-before'));
	},
	'click #code-after': function(e) {
		e.preventDefault();
		$('#code-after').tab('show');
		editArea('#edit-code-after', $('#textarea-code-after'));
	},
	'click #code-tests': function(e) {
		e.preventDefault();
		$('#code-tests').tab('show');
		editArea('#edit-code-tests', $('#textarea-code-tests'));
	},
	'click .exercise-nav': function(e) {
		e.preventDefault();
		Session.set('currentExercise', this._id);
	},
	'click #new-exercise': function(e) {
		var that = this;
		Exercises.insert({
			set_id: this.set_id,
			number: 1,
			letter: '',
			text: '',
			title: 'Rename me',
			points: 5,
			createdAt: + (new Date),
			owner: Meteor.userId(),
			lang: this.lang,
			published: false
		}, function(error, result) {
			if (result) {
				Session.set('currentExercise', result);

				Exams.update(that.set_id, {$push: {exercises: result}});
			}
		});
	},
	'submit #form_new_exercise': function(e) {
		e.preventDefault();
		var that = this;
		var values = $('#form_new_exercise').serializeArray();
		var res = {};
		for (var key in values) {
			var obj = values[key];
			res[obj.name] = obj.value;
		}
		res['title'] = $('#title').editable('getValue').title;
		if (res['title'] === 'Rename me') {
			alert("Title of exercise can not be 'Rename me'");
			return;
		}
		console.log(res);

		var ex = {
			number: parseInt(res['number']),
			letter: res['letter'],
			text: res['text'],
			title: res['title'],
			points: parseInt(res['points']),
			modifiedAt: + (new Date),
			modifiedBy: Meteor.userId(),
        	// lang: res['lang'],
        	before: res['before'],
        	after: res['after'],
        	tests: res['tests']
        }

        Exercises.update(that._id, {$set: ex}, function(error, result) {
        	if (result) {
        		notifyStandard('Added ' + ex['title'], ex['title'] + ' was added to the exam <strong>' + that.title +'</strong>', 'success');
        	}
        	if (error)
        		notifyStandard('Could not add exercise', 'Something went wrong \n Error message: ' + error, 'error');
        });
    }
});

Template.creator.rendered =  function() {
	editArea('#edit-code-text', $('#textarea-code-text'));
	$('#title').editable({
		mode: 'inline'
	});
	var converter = new Showdown.converter();
	var live = converter.makeHtml($('#textarea-code-text').val());
	$('#livemarkdown').html(live);
}