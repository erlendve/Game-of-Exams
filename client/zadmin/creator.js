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
		return Exercises.find({set_id: this.set_id}, {sort: {number: 1, letter: 1}});
	},
	'isActive': function(options) {
		if (Session.get('currentExercise') === this._id)
			return 'class=active';
	}
});

var GLOBALEDITOR;
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


	var curTab = Session.get('currentTab');
	if (curTab) {
		editor.focus();
		editor.gotoLine(curTab.row, curTab.col);
	} else {
		editor.focus();
		editor.gotoLine(editor.session.getLength()+1);
	}

	GLOBALEDITOR = editor;
};

Template.creator.events({
	'click #editorTabPane a': function(e) {
		e.preventDefault;
		var tabName = e.currentTarget.id.substr(5);
		$('#code-' + tabName).tab('show');
		editArea('#edit-code-' + tabName, $('#textarea-code-' + tabName));
		return false;
	},
	'click .exercise-nav': function(e) {
		e.preventDefault();
		Session.set('currentExercise', this._id);
		var curTab = Session.get('currentTab');
		if (curTab) {
			$('#' +curTab.tab)[0].click();
		} else {
			$('#code-text')[0].click();
		}
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
	'click #submit-exercise': function(e) {
		if (GLOBALEDITOR) {
			var cursor = GLOBALEDITOR.selection.getCursor();
			var tab = $('#editorTabPane .active');
			if (tab.length !== 0) {
				Session.set('currentTab', {
					tab: tab[0].firstChild.id,
					row: cursor.row+1,
					col: cursor.column
				});
			};
		}
	},
	'click #submit-exercise-cancel': function(e) {
		alert('cancel does currently not work, click some other exercise to reset');
	},
	// 'click #delete-exercise': function(e) {
	// 	var that = this;
	// 	var solutionArray = Solutions.find({exerciseId: this._id}).fetch();
	// 	var answerArray = Answers.find({exercise_id: this._id}).fetch()
	// 	if (!confirm('This will delete exercise \"' + that.title + '\" and make ' +  solutionArray.length 
	// 		+ ' user solutions unavailable. The same will happen with ' + answerArray.length + ' number of user answers. Are you sure you want to do this?')) {
	// 		return false;
	// 	}

		
	// 	if (solutionArray.length > 0 && answerArray.length > 0) {
	// 		if(confirm('Do you want to delete answers and solutions as well?')) {
	// 			for (var i = solutionArray.length - 1; i >= 0; i--) {
	// 				Solutions.remove(solutionArray[i]._id);
	// 			};
	// 			alert('All solutions to ' + this.title + ' has been deleted');

	// 			for (var i = answerArray.length - 1; i >= 0; i--) {
	// 				Answers.remove(answerArray[i]._id);
	// 			};
	// 			alert('All answers to ' + this.title + ' has been deleted');
	// 		}			
	// 	}
	// 	Exercises.remove(this._id);
	// 	if (Exercises.findOne)
	// 	Session.set('curr')
	// },
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

		var inh = $('#inherit').editable('getValue');
		var sorted = [];
		if (inh['inherit']) {
			var hundreds = [];
			for (var i = inh['inherit'].length - 1; i >= 0; i--) {
				var ex = Exercises.findOne(inh['inherit'][i]);
				var chr = ex.letter.charCodeAt(0)-97;
				hundreds[ex.number*100 + chr] = inh['inherit'][i];
			};

			for (var i = hundreds.length - 1; i >= 0; i--) {
				if (hundreds[i])
					sorted.push(hundreds[i]);
			};
			res['inherit'] = sorted;
		}

		var ex = {
			number: parseInt(res['number']),
			letter: res['letter'],
			text: res['text'],
			title: res['title'],
			points: parseInt(res['points']),
			modifiedAt: + (new Date),
			modifiedBy: Meteor.userId(),
        	// lang: res['lang'],
        	inherit: res['inherit'],
        	lang: "java7",
        	before: res['before'],
        	after: res['after'],
        	pre: res['pre'],
        	tests: res['tests']
        }
        
        Exercises.update(that._id, {$set: ex}, function() {
        	notifyStandard('Edited ' + ex['title'], ex['title'] + ' has changed', 'success');
        });
    }
});

Template.creator.rendered =  function() {
	//click first exercise if no one exists
	if ($('.nav-pills .active').length == 0) {
		$('.nav-pills a').first()[0].click();
	}

	var curTab = Session.get('currentTab');
	// open the current tab, or open exercise-text if no previous
	if (curTab) {
		$('#' +curTab.tab)[0].click();
	} else {
		$('#code-text')[0].click();
	}

	//X-editable exercise title
	$('#title').editable({
		mode: 'inline'
	});

	//live markdown of exercise text
	var converter = new Showdown.converter();
	var live = converter.makeHtml($('#textarea-code-text').val());
	$('#livemarkdown').html(live);

	//fill inheritance checklist
	var curEx = Exercises.findOne(Session.get('currentExercise'));
	var selectOptions = [];
	Exercises.find({set_id: this.data._id}, {sort: {number: 1, letter: 1}}).forEach(function(ex) {
		if (ex._id !== curEx._id) {
			// if (ex.number <== curEx.number)
				// console.log('less');
			//if (ex['number'] == curEx['number']) {
			//	if (ex['letter'] <== curEx['letter'])
			selectOptions.push({value: ex._id, text: ex.title});
			//}
		}
	});

	$('#inherit').editable({
		value: curEx['inherit'],
		source: selectOptions
	});
}

//TODO fix inheritance stuff for player.js