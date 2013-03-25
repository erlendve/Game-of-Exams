Template.player.helpers({
	'currentExam': function() {
		var exam_id = Session.get('subpage');

		if (exam_id) {
			return Exams.findOne(exam_id);
		} else 
		return false;
	},
	'examPoints': function() {
		var cur = 0;
		var tot = 0;
		var myId = Meteor.userId();
		Exercises.find({set_id: this._id}).forEach( function(ex) {
			var sol = Solutions.findOne({exerciseId: ex._id, userId: myId});
			if (sol) {
				if (sol.points) {
					cur += sol.points;
				} else {
					cur += ex.points;
				}
			}

			tot += ex.points;
		});
		return {current: cur, total: tot};
	},
	'exercises': function () {
		var myId = Meteor.userId();
		return Exercises.find({set_id: this._id}, {sort: {number: 1, letter: 1}}).map(function(ex) {
			ex['solution'] = Solutions.findOne({exerciseId: ex._id, userId: myId});
			if (ex['inherit'] && ex['inherit'].length > 0) {
				ex['pre'] = ex['pre'] + '\n\n//Code from previous exercises';
				var needsToSolve = [];
				for (var i = 0; i < ex.inherit.length; i++) {
					var sol = Solutions.findOne({userId: myId, exerciseId: ex.inherit[i]});
					if (sol) {
						ex['pre'] = ex['pre'] + '\n' + sol.code;
					} else {
						needsToSolve.push(ex.inherit[i]);
					}
				}
				if (needsToSolve.length > 0) {
					ex.needsToSolve = needsToSolve;
				}
			}

			return ex;
			;});
	}
});

Template.player.rendered = function() {
	$('code').each(function(i, e) {hljs.highlightBlock(e)});
	// $('.bs-docs-sidebar').scrollspy();
	$('.bs-docs-sidenav').affix({offset: {top: $('header').outerHeight()}})
	
	//if currentExercise is set show the collapse and render editor, if no exercise is current. Render first as current
	// var cur = Session.get('currentExercise');
	// if (cur) {
		// $('#' + cur + ' .collapse').addClass('in');
		// $('#' + cur + ' .clickforeditor').click();
	// }

	$('.exercise').waypoint({
		context: window,
		continuous: false,
		enabled: true,
		horizontal: false,
		offset: 100,
		triggerOnce: false,
		'handler': function(direction) {
			if (direction == 'down') {

				$('.active').removeClass('active');
				$('#li_' + this.id).addClass('active');
				// var next = $(this).waypoint('next');
				// if (next[0] && !$(next[0]).find('.collapse').hasClass('in')) {
				// 	var nextId = next[0].id;
				// 	var el = $(next[0]).find('.collapse');
				// 	el.on('show', function() {
				// 		$(this).find('.clickforeditor').click();

				// 	});
				// 	el.on('shown', function() {
				// 		$.waypoints('refresh');
				// 	});
				// 	el.collapse({
				// 		show: true
				// 	});
				// }
			} else {
				var prev = $(this).waypoint('prev');
				if (prev[0]) {
					var prevId = prev[0].id;
					$('.active').removeClass('active');
					$('#li_' + prevId).addClass('active');
				}
			}
		}
	});

	//show all when player has rendered
	$('.clickforeditor').click()
	// $('.collapse').collapse({show: true});

	// var el = $('.exercise .collapse').first();
	// el.on('show', function() {
	// 	$(this).find('.clickforeditor').click();

	// });
	// el.on('shown', function() {
	// 	$.waypoints('refresh');
	// });
	// el.collapse({
	// 	show: true
	// });
	// $('.exercise').waypoint(function() {
	// 	console.log('Element bottom hit window top');
	// }, {
	// 	offset: function() {
	// 		return -$(this).height();
	// 	}
	// });

	// $('li').first().addClass('active');
	// var list = $.waypoints('above');
	// console.log(list);

	// returns a jQuery object suitable for setting scrollTop to
  // scroll the page, either directly for via animate()
  // var scroller = function() {
  // 	return $("html, body").stop();
  // };

//   var sections = [];
//   _.each($('.exercise'), function (elt) {
//   	var classes = (elt.getAttribute('class') || '').split(/\s+/);
//     // if (_.indexOf(classes, "nosection") === -1)
//     sections.push(elt);
// });

  // for (var i = 0; i < sections.length; i++) {
  // 	var classes = (sections[i].getAttribute('class') || '').split(/\s+/);
  //   // if (_.indexOf(classes, "nosection") !== -1)
  //     // continue;
  //     sections[i].prev = sections[i-1] || sections[i];
  //     sections[i].next = sections[i+1] || sections[i];
  //     $(sections[i]).waypoint({offset: 30});
  // }
  // var section = document.location.hash.substr(1) || sections[0].id;
  // Session.set('section', section);
//   if (section) {
//     // WebKit will scroll down to the #id in the URL asynchronously
//     // after the page is rendered, but Firefox won't.
//     Meteor.setTimeout(function() {
//     	var elem = $('#'+section);
//     	if (elem.length)
//     		scroller().scrollTop(elem.offset().top -95);
//     }, 0);
// }

// var ignore_waypoints = false;
// $('body').delegate('h1, h2, h3', 'waypoint.reached', function (evt, dir) {
// 	if (!ignore_waypoints) {
// 		var active = (dir === "up") ? this.prev : this;
// 		Session.set("section", active.id);
// 	}
// });

// window.onhashchange = function () {
// 	scrollToSection(location.hash);
// };

// var scrollToSection = function (section) {
// 	console.log('scrolling yo');
// 	ignore_waypoints = true;
// 	// console.log(section);
// 	Session.set("section", section.substr(1));
// 	scroller().animate({
// 		scrollTop: $(section).offset().top - 95
// 	}, 500, 'swing', function () {
// 		// window.location.hash = section;
// 		ignore_waypoints = false;
// 	});
// };

// $('.bs-docs-sidebar, .exercises').delegate("a[href^='#']", 'click', function (e) {
// 	e.preventDefault();
// 	console.log('delegate');
// 	var sel = $(this).attr('href');
// 	$('.active').removeClass('active');
// 	$('#li_' + sel.substr(1)).addClass('active');
// 	scrollToSection(sel);
// 	var reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
//     var pathname = reg.exec(e.currentTarget.href)[1];
//     console.log(pathname + sel);
// 	Router.navigate(pathname + sel, true);
// });

	// $('textarea').each(function (i, el) {
	// 	var $el,
	// 	$container,
	// 	editor;

	// 	$el = $(el);

	// 	//
 //        // Principle: inject an DOM element (sized and positioned) and hide the textarea
 //        //

 //        $container = $('<div/>').css({
 //        	position: 'relative',
 //        	width: $el.width(),
 //        	height: $el.height(),
 //        	border: "1px solid gray"
 //        }).insertAfter(el);

 //        $el.hide();

 //        //
	// 	// ACE magic
	// 	//

	// 	editor = ace.edit($container[0]);

	// 	editor.setTheme("ace/theme/chaos");
	// 	editor.getSession().setMode("ace/mode/java");
	// 	// Keep hidden textarea in sync

	// 	editor.getSession().setValue($el.val());
	// 	editor.getSession().on('change', function () {
	// 		$el.val(editor.getSession().getValue());
	// 	}); 
	// });
$.waypoints('refresh');
console.log('player rendered');
}

Template.player.preserve({
	'.exercise': function (node) { 
		var cur = Session.get('currentExercise');
		if (cur && cur == node.id) {
			return;
		}
		return node.id; 
	}
});

//////// Exercise sidenav ////////
Template.exercise_sidenav.events({
	'click .exercise-side': function(e) {
		if (!$('#' + this._id + ' .collapse').hasClass('in'))
			$('#' + this._id + ' .collapse').collapse('show');


		e.preventDefault();
		Router.navigate('exam/' + this.set_id + '#' + this._id, false)
		Router.scrollToSection('#' + this._id, -95, true);
	}
});

//Check if the sidebar is showing an exercise with letters, if letters are b and below, return true 
Template.exercise_sidenav.helpers({
	'lettered': function(conditional, options) {
		if (this.letter === "" || this.letter === 'a') {
			return options.inverse(this);
		} else {
			return options.fn(this);
		}
	}
});

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
	},
	'findUnsolved': function() {
		var found = [];
		for (var i = this['needsToSolve'].length - 1; i >= 0; i--) {
			var ex = Exercises.findOne(this['needsToSolve'][i]);
			if (i === this['needsToSolve'].length - 1) {
				ex['first'] = true;
			}
			found.push(ex);
		};
		return found;
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
	'click .btn-edit-answer': function(e) {
		e.preventDefault();
		Answers.update(this._id, {$set: {saved: false}});
		var ex = Exercises.findOne(this.exercise_id);
		notifyStandard('Editing answer', 'You are editing answer on <strong>' + ex.title + '</strong><br /> You need to submit again to save your answer', 'info', 'icon-edit');
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
	},
	'click .linkToUnsolved': function(e) {
		e.preventDefault();
		Router.navigate('exam/' + this.set_id + '#' + this._id, false)
		Router.scrollToSection('#' + this._id, -95, true);
	}
});

///////// form_answer /////////
Template.form_answer.rendered = function() {

	// var cur = Session.get('currentExercise');
	// if (cur && cur === this.exercise_id || cur == this._id) {
	// 	console.log(this._id);
	// }
};

Template.form_answer.events({
	'click .btn-success': function(e) {
		// $.waypoints('disable')
		$(e.currentTarget).attr('disabled', true);
		var form = $('#form_answer_' + this._id);
		var values = form.serializeArray();
		var answertext = values[0].value;
		var runTests = false;
		if (answertext.length < 1) {
			alert("You have not edited any text in the editor. Or the the editor is empty.");
			$(e.currentTarget).attr('disabled', false);
			return false;
		}

		//if it is an existing answer with answer context
		if(this.exercise_id) {
			Session.set('currentExercise', this.exercise_id);
			console.log('submitting answer on already existing answer')
			Meteor.call('submitAnswer', answertext, this.set_id, this._id, true, runTests);

			//else it is a new answer with exercise context
		} else {
			Session.set('currentExercise', this._id);
			Meteor.call('submitAnswer', answertext, this.set_id, this._id, false, runTests);
		}

		// var user = Meteor.user();
		// //TODO implement this when publishing Players collection?
		// if (!Players.findOne({userId: user._id})) {
			// 	Players.insert({userId: user._id, username: user.username, points: 0, exercises_done: 0, achievements_done: 0});
			// }
			// //TODO do this better so it does an insert if update fails
			// if (Answers.find({userId: Meteor.userId(), exercise_id: this._id}).count() > 0) {
				// 	Answers.update({'userId': Meteor.userId(), 'exercise_id': this._id}, {$set : {'answertext': answertext, 'edited': moment().format()}});
				// 	// Players.update({userId: Meteor.userId()},{$inc: {points: ans.points, exercises_done: 1}});
				// } else {
					// 	// Answers.insert({'userId': Meteor.userId(), 'set_id': this.set_id, 'exercise_id': this._id, 'answertext': answertext, 'points': this.points, 'created': moment().format()});
					// 	// Players.update({userId: Meteor.userId()},{$inc: {points: this.points, exercises_done: 1}});
					// 	// Players.update({userId: Meteor.userId()}, {$set: {achievements: null, achievements_done: 0}});
					// 	// notifyStandard(this.points + ' points awarded', 'Congratulations! You got ' + this.points+ ' points for answering <strong>' + this.title + '</strong>', 'success', 'icon-thumbs-up');
					// 	Meteor.call('submitAnswer', answertext, this.set_id, this._id, 
						// 		function(error, result) {
							// 			// console.log('result:' + result);
							// 		});
		// }
		// return false;
	},
	'click .btn-primary': function(e) {
		// $.waypoints('disable')
		$(e.currentTarget).attr('disabled', true);
		var form = $('#form_answer_' + this._id);
		var values = form.serializeArray();
		var answertext = values[0].value;
		var runTests = true;

		//if it is an existing answer with answer context
		console.log('Pressed Test button!');
		if(this.exercise_id) {
			Session.set('currentExercise', this.exercise_id);
			Meteor.call('submitAnswer', answertext, this.set_id, this._id, true, runTests, function() {});

			//else it is a new answer with exercise context
		} else {
			Session.set('currentExercise', this._id);
			Meteor.call('submitAnswer', answertext, this.set_id, this._id, false, runTests, function() {});
		}
	},
	'submit': function(e) {
		e.preventDefault();
		return false;
	},
	'click .clickforeditor': function(e) {
		var $el,
		$ed,
		$container,
		editor;

		//hidden textarea
		$el = $('#answer' + this._id);
		//where the editor will be placed
		$ed = $("#editor" + this._id).removeClass('clickforeditor').addClass("editor");
		editor = ace.edit("editor" + this._id);

		//fill with prefilled text from exercise if no text in editor
		if (editor.getValue().length < 1) {
			var ex = Exercises.findOne(this.exercise_id)
			if (ex) {
				editor.setValue(ex.pre);
				editor.focus();
				editor.gotoLine(editor.session.getLength()+1);
			}
		}
		editor.setTheme("ace/theme/monokai");
		editor.getSession().setMode("ace/mode/java");
		editor.getSession().on('change', function () {
			$el.val(editor.getSession().getValue());
		}); 
	}
});