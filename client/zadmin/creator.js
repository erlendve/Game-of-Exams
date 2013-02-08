Template.creator.currentExercise = function () {
	var self = this;
	var cur = Session.get('currentExercise');
	if (cur) {
		return Exercises.findOne(cur);
	} else {
		if (this.exercises)
			Session.set('currentExercise', this.exercises[0]);
		else {
			Exercises.insert({
				set_id: this._id,
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
					Exams.update(self._id, {$set: {exercises: [result]}});
				}
			});
		}
	}
};