//Collections go here

//The exercises
Exercises = new Meteor.Collection('exercises');

//The exams
Exams = new Meteor.Collection('exams');

//The Courses
Courses = new Meteor.Collection('courses');

//The answers given by players
Answers = new Meteor.Collection('answers');

//Data about users, specifically related to their scores, badges etc.
Players = new Meteor.Collection('players');

///////// Allow & deny rules ////////
Answers.allow({
	insert: function (userId, doc) {
    	// the user must be logged in, and the document must be owned by the user
    	// return (userId && doc.owner === userId);
    	return false;
    },
    update: function (userId, docs, fields, modifier) {
        return false;
    	// // can only change your own documents
    	// return _.all(docs, function(doc) {
    	// 	return doc.userId === userId;
    	// });
    },
    remove: function (userId, docs) {
    	// can only remove your own documents
    	return _.all(docs, function(doc) {
           return doc.userId === userId;
       });
    },
    fetch: ['userId']
});

Answers.deny({
	// update: function (userId, docs, fields, modifier) {
 //    	// can't change owners
 //    	return _.contains(fields, 'owner');
 //    },
 //    remove: function (userId, docs) {
 //   		// can't remove locked documents
 //   		return _.any(docs, function (doc) {
 //   			return doc.locked;
 //   		});
 //   	},
 //  fetch: ['locked'] // no need to fetch 'owner'
});

if (Meteor.isServer) {
    (function() {
        var green = {
            'insert': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            },
            'update': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            },
            'remove': function() {
                return Meteor.user() && Meteor.user().isAdmin;
            }   
        }
        Exercises.allow(green);
        Exams.allow(green);
        Courses.allow(green);
        Players.allow(green);
        Answers.allow(green);
    })();
}

// function Exercise (ex_set, number, letter, title, text, points) {
// 	this.set_id = ex_set; //the id of the exercise set this belongs to
// 	this.number = number;
// 	this.letter = letter;
// 	this.text = text;
// 	this.title = title;
// 	this.points = points;
// }

function Exercise_set(course, title, year) {
	this.courseId = course; //The id of the course this set belongs to
	this.title = title;
	this.year = year;
    this.createdAt = +(new Date);
	this.exercises = []; //The exercises id's that is a part of this set
	this.published = false;
}

// On server startup, create some exercises if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
		// console.log('Server starting');
		// console.log(Exercises.find().count() + ' exercises in database');
		// console.log(Exams.find().count() + ' exams in database');
		// Exams.find().forEach( function(exam) {
		// 	console.log(exam);
		// });
		// console.log(Courses.find().count() + ' courses in database');
		// console.log(Meteor.users.find().fetch());
	});
}